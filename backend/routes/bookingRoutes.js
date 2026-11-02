const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.get(
    "/",
    requireAuth,
    requireRole("Admin", "Laboratory Staff", "Student"),
    bookingController.getAllBookings
);

router.get(
    "/booked-dates",
    requireAuth,
    requireRole("Admin", "Laboratory Staff", "Student"),
    bookingController.getBookedDates
);

router.post(
    "/",
    requireAuth,
    requireRole("Admin", "Laboratory Staff", "Student"),
    bookingController.createBooking
);

// Only Admin can manually override a booking status.
router.patch(
    "/:booking_id/status",
    requireAuth,
    requireRole("Admin"),
    bookingController.updateBookingStatus
);

module.exports = router;
