
const {
    getAllBookings,
    createBooking
} = require('../models/bookingModel');

const ok = (res, data, status = 200) => res.status(status).json({
    success: true,
    data,
    meta: {
        timestamp: new Date().toISOString(),
        count: Array.isArray(data) ? data.length : 1
    }
});

const fail = (res, code, message, status) => res.status(status).json({
    success: false,
    error: { code, message }
});

exports.getAllBookings = (req, res) => {
    getAllBookings((err, results) => {
        if (err) {
            console.error("Error retrieving bookings:", err);
            return fail(res, 'SERVER_ERROR', 'Failed to retrieve bookings.', 500);
        }

        return ok(res, results);
    });
};

exports.createBooking = (req, res) => {
    const {
        requester_id,
        lab_id,
        schedule_id,
        requested_date,
        start_time,
        end_time,
        purpose,
        status_id
    } = req.body;

    if (
    !lab_id ||
    !schedule_id ||
    !requested_date ||
    !start_time ||
    !end_time ||
    !purpose ||
    !status_id
) {
        return fail(
            res,
            'MISSING_FIELDS',
            'Please provide all required booking fields.',
            400
        );
    }

    if (end_time <= start_time) {
        return fail(
            res,
            'INVALID_TIME',
            'End time must be later than start time.',
            400
        );
    }

    const bookingData = {
        requester_id,
        lab_id,
        schedule_id,
        requested_date,
        start_time,
        end_time,
        purpose,
        status_id
    };

    
createBooking(bookingData, (err, results) => {
    if (err) {
        console.error("Error creating booking:", err);

        return fail(
            res,
            'CREATE_FAILED',
            'Failed to create booking. Check the submitted information.',
            500
        );
    }

if (results.invalidSchedule) {
    return fail(
        res,
        'INVALID_SCHEDULE',
        'The selected schedule does not exist or is unavailable.',
        400
    );
}

    if (results.conflict) {
        return fail(
            res,
            'BOOKING_CONFLICT',
            'This laboratory is already booked during that time.',
            409
        );
    }

    return ok(res, {
        booking_id: results.insertId,
        message: 'Booking request created successfully.'
    }, 201);
});
}

