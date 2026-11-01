
const pool = require("../db");

async function getAllBookings() {

    const [results] = await pool.query(
        "SELECT * FROM bookings"
    );

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
        purpose,
        status_id
    } = bookingData;

    const scheduleSQL = `
        SELECT schedule_id
        FROM schedules
        WHERE schedule_id = ?
            AND lab_id = ?
            AND schedule_date = ?
            AND is_available = 1
            AND start_time <= ?
            AND end_time >= ?
    `;

    const [schedules] = await pool.query(
        scheduleSQL,
        [schedule_id, lab_id, requested_date, start_time, end_time]
    );

    if (schedules.length === 0) {
        return {
            invalidSchedule: true
        };
    }

    const conflictSQL = `
        SELECT b.booking_id
        FROM bookings b
        INNER JOIN booking_statuses bs
            ON b.status_id = bs.status_id
        WHERE b.lab_id = ?
            AND b.requested_date = ?
            AND bs.status_name IN ('Pending', 'Approved')
            AND ? < b.end_time
            AND ? > b.start_time
    `;

    const [conflicts] = await pool.query(
        conflictSQL,
        [lab_id, requested_date, start_time, end_time]
    );

    if (conflicts.length > 0) {
        return {
            conflict: true,
            booking_id: conflicts[0].booking_id
        };
    }

    const insertSQL = `
        INSERT INTO bookings
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(
        insertSQL,
        [
            requester_id ?? null,
            lab_id,
            schedule_id,
            requested_date,
            start_time,
            end_time,
            purpose,
            status_id
        ]
    );

    return result;
}


module.exports = {
    getAllBookings,
    createBooking
};
