const {
    getAllBookings,
    getBookedDates,
    createBooking,
    updateBookingStatus
} = require("../models/bookingModel");

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

// GET ALL BOOKINGS
exports.getAllBookings = async (req, res) => {
    try {
        const user = req.session.user;

        const requesterId = user.role === "Student"
            ? user.user_id
            : null;

        const results = await getAllBookings(requesterId);

        return ok(res, results);
    } catch (err) {
        console.error("Error retrieving bookings:", err);

        return fail(
            res,
            "SERVER_ERROR",
            "Failed to retrieve bookings.",
            500
        );
    }
};

// GET BOOKED DATES FOR A SELECTED LABORATORY
exports.getBookedDates = async (req, res) => {
    try {
        const { lab_id } = req.query;

        if (
            !lab_id ||
            !Number.isInteger(Number(lab_id)) ||
            Number(lab_id) < 1
        ) {
            return fail(
                res,
                "INVALID_LAB_ID",
                "Please provide a valid laboratory ID.",
                400
            );
        }

        const results = await getBookedDates(Number(lab_id));

        return ok(res, results);
    } catch (err) {
        console.error("Error retrieving booked dates:", err);

        return fail(
            res,
            "SERVER_ERROR",
            "Failed to retrieve booked dates.",
            500
        );
    }
};

// CREATE BOOKING WITH SCHEDULE VALIDATION
exports.createBooking = async (req, res) => {
    try {
        const {
            lab_id,
            schedule_id,
            requested_date,
            start_time,
            end_time,
            purpose
        } = req.body;

        if (
            lab_id === undefined ||
            schedule_id === undefined ||
            !requested_date ||
            !start_time ||
            !end_time ||
            typeof purpose !== "string" ||
            !purpose.trim()
        ) {
            return fail(
                res,
                "MISSING_FIELDS",
                "Please provide all required booking fields.",
                400
            );
        }

        if (
            !Number.isInteger(Number(lab_id)) ||
            Number(lab_id) < 1 ||
            !Number.isInteger(Number(schedule_id)) ||
            Number(schedule_id) < 1
        ) {
            return fail(
                res,
                "INVALID_ID",
                "Laboratory ID and schedule ID must be positive integers.",
                400
            );
        }

        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        const parsedDate = new Date(`${requested_date}T00:00:00Z`);

        if (
            typeof requested_date !== "string" ||
            !datePattern.test(requested_date) ||
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== requested_date
        ) {
            return fail(
                res,
                "INVALID_DATE",
                "Please provide a valid date in YYYY-MM-DD format.",
                400
            );
        }

        const timePattern = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

        if (
            typeof start_time !== "string" ||
            typeof end_time !== "string" ||
            !timePattern.test(start_time) ||
            !timePattern.test(end_time)
        ) {
            return fail(
                res,
                "INVALID_TIME",
                "Please provide valid times in HH:MM or HH:MM:SS format.",
                400
            );
        }

        const normalizedStart = start_time.length === 5
            ? `${start_time}:00`
            : start_time;

        const normalizedEnd = end_time.length === 5
            ? `${end_time}:00`
            : end_time;

        if (normalizedEnd <= normalizedStart) {
            return fail(
                res,
                "INVALID_TIME",
                "End time must be later than start time.",
                400
            );
        }

        if (purpose.trim().length > 255) {
            return fail(
                res,
                "INVALID_PURPOSE",
                "Purpose must not exceed 255 characters.",
                400
            );
        }

        const bookingData = {
            requester_id: req.session.user.user_id,
            lab_id: Number(lab_id),
            schedule_id: Number(schedule_id),
            requested_date,
            start_time: normalizedStart,
            end_time: normalizedEnd,
            purpose: purpose.trim()
        };

        const result = await createBooking(bookingData);

        if (result.labNotFound) {
            return fail(
                res,
                "LAB_NOT_FOUND",
                "The selected laboratory does not exist.",
                404
            );
        }

        if (result.invalidSchedule) {
            return fail(
                res,
                "INVALID_SCHEDULE",
                "The selected schedule does not exist or is unavailable.",
                400
            );
        }

        // Preserve the existing behavior:
        // rejected bookings can still be saved and logged.
        return ok(res, {
            booking_id: result.booking_id || result.insertId,
            status: result.status || "Pending",
            message: result.message || "Booking request created successfully."
        }, 201);

    } catch (err) {
        console.error("Error creating booking:", err);

        return fail(
            res,
            "SERVER_ERROR",
            "Failed to create booking.",
            500
        );
    }
};

// UPDATE BOOKING STATUS
exports.updateBookingStatus = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const { status_id } = req.body;

        if (
            !Number.isInteger(Number(booking_id)) ||
            Number(booking_id) < 1
        ) {
            return fail(
                res,
                "INVALID_BOOKING_ID",
                "Booking ID must be a positive integer.",
                400
            );
        }

        if (
            !Number.isInteger(Number(status_id)) ||
            Number(status_id) < 1
        ) {
            return fail(
                res,
                "INVALID_STATUS",
                "Status ID must be a positive integer.",
                400
            );
        }

        const result = await updateBookingStatus(
            Number(booking_id),
            Number(status_id)
        );

        if (result.notFound) {
            return fail(
                res,
                "BOOKING_NOT_FOUND",
                "Booking does not exist.",
                404
            );
        }

        if (result.labNotFound) {
            return fail(
                res,
                "LAB_NOT_FOUND",
                "The laboratory associated with this booking does not exist.",
                404
            );
        }

        if (result.invalidStatus) {
            return fail(
                res,
                "INVALID_STATUS",
                "The selected booking status does not exist.",
                400
            );
        }

        if (result.conflict) {
            return fail(
                res,
                "BOOKING_CONFLICT",
                result.conflicting_booking_id
                    ? `Cannot update this booking because it overlaps booking ${result.conflicting_booking_id}.`
                    : "Cannot update this booking because another active booking overlaps with it.",
                409
            );
        }

        return ok(res, {
            message: "Booking status updated successfully."
        });

    } catch (err) {
        console.error("Error updating booking status:", err);

        return fail(
            res,
            "SERVER_ERROR",
            "Failed to update booking status.",
            500
        );
    }
};
