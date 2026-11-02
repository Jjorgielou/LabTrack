const pool = require("../config/db");

// GET ALL BOOKINGS
async function getAllBookings(requesterId = null) {
    let query = `
        SELECT
            b.*,
            CONCAT(u.first_name, ' ', u.last_name) AS requester_name,
            u.email AS requester_email,
            l.lab_name,
            l.location AS lab_location,
            bs.status_name
        FROM bookings b
        LEFT JOIN users u ON b.requester_id = u.user_id
        LEFT JOIN laboratories l ON b.lab_id = l.lab_id
        LEFT JOIN booking_statuses bs ON b.status_id = bs.status_id
    `;

    const values = [];

    if (requesterId !== null) {
        query += ` WHERE b.requester_id = ?`;
        values.push(requesterId);
    }

    query += ` ORDER BY b.created_at DESC`;

    const [results] = await pool.query(query, values);
    return results;
}

// GET BOOKED DATES
// All dates remain selectable. Time conflicts are checked during submission.
async function getBookedDates(labId) {
    return [];
}

// CREATE BOOKING WITH AUTOMATIC APPROVAL / REJECTION
async function createBooking(bookingData) {
    const {
        requester_id,
        lab_id,
        requested_date,
        start_time,
        end_time,
        purpose
    } = bookingData;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Lock the laboratory to prevent simultaneous booking requests.
        const [labs] = await connection.query(
            `SELECT lab_id
             FROM laboratories
             WHERE lab_id = ?
             FOR UPDATE`,
            [lab_id]
        );

        if (labs.length === 0) {
            await connection.rollback();
            return { labNotFound: true };
        }

        // Check overlapping Pending or Approved bookings.
        // Non-overlapping bookings on the same date are allowed.
        const [conflicts] = await connection.query(
            `SELECT b.booking_id
             FROM bookings b
             INNER JOIN booking_statuses bs
                 ON b.status_id = bs.status_id
             WHERE b.lab_id = ?
               AND b.requested_date = ?
               AND bs.status_name IN ('Pending', 'Approved')
               AND b.start_time < ?
               AND b.end_time > ?
             FOR UPDATE`,
            [lab_id, requested_date, end_time, start_time]
        );

        // Save overlapping booking attempts as Rejected.
        if (conflicts.length > 0) {
            const [rejectedStatuses] = await connection.query(
                `SELECT status_id
                 FROM booking_statuses
                 WHERE status_name = 'Rejected'`
            );

            if (rejectedStatuses.length === 0) {
                throw new Error("Rejected booking status was not found.");
            }

            const conflictingBookingId = conflicts[0].booking_id;

            const [rejectedBooking] = await connection.query(
                `INSERT INTO bookings
                 (
                     requester_id, lab_id, schedule_id,
                     requested_date, start_time, end_time,
                     purpose, status_id
                 )
                 VALUES (?, ?, NULL, ?, ?, ?, ?, ?)`,
                [
                    requester_id,
                    lab_id,
                    requested_date,
                    start_time,
                    end_time,
                    purpose,
                    rejectedStatuses[0].status_id
                ]
            );

            const rejectedBookingId = rejectedBooking.insertId;

            await connection.query(
                `INSERT INTO conflict_logs
                 (
                     booking_id, conflict_booking_id, lab_id,
                     conflict_type, description, conflict_status
                 )
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    rejectedBookingId,
                    conflictingBookingId,
                    lab_id,
                    "Time Overlap",
                    `Booking ${rejectedBookingId} was rejected because its requested time overlaps booking ${conflictingBookingId} for laboratory ${lab_id} on ${requested_date}.`,
                    "detected"
                ]
            );

            await connection.commit();

            return {
                conflict: true,
                booking_id: rejectedBookingId,
                conflicting_booking_id: conflictingBookingId,
                status: "Rejected",
                message: "Booking rejected because its requested time overlaps an existing booking."
            };
        }

        // Check schedules for this laboratory and date.
        const [schedules] = await connection.query(
            `SELECT schedule_id, start_time, end_time, is_available
             FROM schedules
             WHERE lab_id = ?
               AND schedule_date = ?`,
            [lab_id, requested_date]
        );

        let statusName = "Pending";
        let scheduleId = null;

        if (schedules.length > 0) {
            // Find an available schedule that fully contains the requested time.
            const matchingSchedule = schedules.find(schedule =>
                Number(schedule.is_available) === 1 &&
                schedule.start_time <= start_time &&
                schedule.end_time >= end_time
            );

            if (matchingSchedule) {
                statusName = "Approved";
                scheduleId = matchingSchedule.schedule_id;
            } else {
                statusName = "Rejected";
            }
        }

        const [statuses] = await connection.query(
            `SELECT status_id
             FROM booking_statuses
             WHERE status_name = ?`,
            [statusName]
        );

        if (statuses.length === 0) {
            throw new Error(`${statusName} booking status was not found.`);
        }

        // Insert the booking with its automatically determined status.
        const [result] = await connection.query(
            `INSERT INTO bookings
             (
                 requester_id, lab_id, schedule_id,
                 requested_date, start_time, end_time,
                 purpose, status_id
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                requester_id,
                lab_id,
                scheduleId,
                requested_date,
                start_time,
                end_time,
                purpose,
                statuses[0].status_id
            ]
        );

        await connection.commit();

        return {
            ...result,
            status: statusName,
            message:
                statusName === "Approved"
                    ? "Booking automatically approved because it fits an available schedule."
                    : statusName === "Rejected"
                        ? "Booking rejected because the requested time does not fit an available schedule."
                        : "Booking submitted for Admin review because no schedule exists for this date."
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// UPDATE BOOKING STATUS (ADMIN OVERRIDE)
async function updateBookingStatus(booking_id, status_id) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [initialBookings] = await connection.query(
            `SELECT lab_id
             FROM bookings
             WHERE booking_id = ?`,
            [booking_id]
        );

        if (initialBookings.length === 0) {
            await connection.rollback();
            return { notFound: true };
        }

        const labId = initialBookings[0].lab_id;

        // Lock the laboratory before checking for conflicts.
        const [labs] = await connection.query(
            `SELECT lab_id
             FROM laboratories
             WHERE lab_id = ?
             FOR UPDATE`,
            [labId]
        );

        if (labs.length === 0) {
            await connection.rollback();
            return { labNotFound: true };
        }

        const [bookings] = await connection.query(
            `SELECT booking_id, lab_id, requested_date, start_time, end_time
             FROM bookings
             WHERE booking_id = ?
             FOR UPDATE`,
            [booking_id]
        );

        const [statuses] = await connection.query(
            `SELECT status_id, status_name
             FROM booking_statuses
             WHERE status_id = ?`,
            [status_id]
        );

        if (statuses.length === 0) {
            await connection.rollback();
            return { invalidStatus: true };
        }

        const booking = bookings[0];
        const status = statuses[0];

        // Pending or Approved bookings cannot overlap another active booking.
        if (
            status.status_name === "Pending" ||
            status.status_name === "Approved"
        ) {
            const [conflicts] = await connection.query(
                `SELECT b.booking_id
                 FROM bookings b
                 INNER JOIN booking_statuses bs
                     ON b.status_id = bs.status_id
                 WHERE b.lab_id = ?
                   AND b.requested_date = ?
                   AND b.booking_id != ?
                   AND bs.status_name IN ('Pending', 'Approved')
                   AND b.start_time < ?
                   AND b.end_time > ?
                 FOR UPDATE`,
                [
                    booking.lab_id,
                    booking.requested_date,
                    booking_id,
                    booking.end_time,
                    booking.start_time
                ]
            );

            if (conflicts.length > 0) {
                const conflictingBookingId = conflicts[0].booking_id;

                await connection.query(
                    `INSERT INTO conflict_logs
                     (
                         booking_id, conflict_booking_id, lab_id,
                         conflict_type, description, conflict_status
                     )
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        booking_id,
                        conflictingBookingId,
                        booking.lab_id,
                        "Status Update Time Overlap",
                        `Booking ${booking_id} could not be changed to ${status.status_name} because it overlaps booking ${conflictingBookingId}.`,
                        "detected"
                    ]
                );

                await connection.commit();

                return {
                    conflict: true,
                    conflicting_booking_id: conflictingBookingId
                };
            }
        }

        const [result] = await connection.query(
            `UPDATE bookings
             SET status_id = ?
             WHERE booking_id = ?`,
            [status_id, booking_id]
        );

        await connection.commit();
        return result;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    getAllBookings,
    getBookedDates,
    createBooking,
    updateBookingStatus
};
