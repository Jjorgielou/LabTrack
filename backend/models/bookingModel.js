
const db = require("../db");

function getAllBookings(callback) {
    db.query(
        "SELECT * FROM bookings",
        (err, results) => {
            if (err) return callback(err, null);

            callback(null, results);
        }
    );
}


function createBooking(bookingData, callback) {
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

    // Check for overlapping Pending or Approved bookings
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

    db.query(
        conflictSQL,
        [lab_id, requested_date, start_time, end_time],
        (err, conflicts) => {
            if (err) return callback(err, null);

            if (conflicts.length > 0) {
                return callback(null, {
                    conflict: true,
                    booking_id: conflicts[0].booking_id
                });
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

            db.query(
                insertSQL,
                [
                    requester_id ?? null,
                    lab_id,
                    schedule_id ?? null,
                    requested_date,
                    start_time,
                    end_time,
                    purpose,
                    status_id
                ],
                (err, results) => {
                    if (err) return callback(err, null);

                    callback(null, results);
                }
            );
        }
    );
}


module.exports = {
    getAllBookings,
    createBooking
};
