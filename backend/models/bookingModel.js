
const pool = require("../config/db");

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
        LEFT JOIN users u
            ON b.requester_id = u.user_id
        LEFT JOIN laboratories l
            ON b.lab_id = l.lab_id
        LEFT JOIN booking_statuses bs
            ON b.status_id = bs.status_id
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


async function createBooking(bookingData) {
    const {
        requester_id,
        lab_id,
        schedule_id,
        requested_date,
        start_time,
        end_time,
        purpose
    } = bookingData;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

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

        const [schedules] = await connection.query(
            `SELECT schedule_id
             FROM schedules
             WHERE schedule_id = ?
               AND lab_id = ?
               AND schedule_date = ?
               AND is_available = 1
               AND start_time <= ?
               AND end_time >= ?
            FOR UPDATE`,
            [
                schedule_id,
                lab_id,
                requested_date,
                start_time,
                end_time
            ]
        );

        if (schedules.length === 0) {
            await connection.rollback();
            return { invalidSchedule: true };
        }

        const [conflicts] = await connection.query(
            `SELECT b.booking_id
             FROM bookings b
             INNER JOIN booking_statuses bs
                 ON b.status_id = bs.status_id
             WHERE b.lab_id = ?
               AND b.requested_date = ?
               AND bs.status_name IN ('Pending', 'Approved')
               AND ? < b.end_time
               AND ? > b.start_time`,
            [lab_id, requested_date, start_time, end_time]
        );

        if (conflicts.length > 0) {
            await connection.rollback();

            return {
                conflict: true,
                booking_id: conflicts[0].booking_id
            };
        }

        const [statuses] = await connection.query(
            `SELECT status_id
             FROM booking_statuses
             WHERE status_name = 'Pending'`
        );

        if (statuses.length === 0) {
            throw new Error("Pending booking status was not found.");
        }

        const pendingStatusId = statuses[0].status_id;

        const [result] = await connection.query(
            `INSERT INTO bookings
             (
                 requester_id,
                 lab_id,
                 schedule_id,
                 requested_date,
                 start_time,
                 end_time,
                 purpose,
                 status_id
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                requester_id,
                lab_id,
                schedule_id,
                requested_date,
                start_time,
                end_time,
                purpose,
                pendingStatusId
            ]
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

        const lab_id = initialBookings[0].lab_id;

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

        const [bookings] = await connection.query(
            `SELECT booking_id, lab_id, requested_date, start_time, end_time
             FROM bookings
             WHERE booking_id = ?
             FOR UPDATE`,
            [booking_id]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return { notFound: true };
        }

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
                   AND ? < b.end_time
                   AND ? > b.start_time`,
                [
                    booking.lab_id,
                    booking.requested_date,
                    booking_id,
                    booking.start_time,
                    booking.end_time
                ]
            );

            if (conflicts.length > 0) {
                await connection.rollback();

                return {
                    conflict: true,
                    conflicting_booking_id: conflicts[0].booking_id
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
    createBooking,
    updateBookingStatus
};
