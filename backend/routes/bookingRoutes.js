const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

// View bookings
router.get(
    "/",
    requireAuth,
    requireRole("Admin", "Laboratory Staff", "Student"),
    bookingController.getAllBookings
);

// Get booked dates for a selected laboratory
router.get(
    "/booked-dates",
    requireAuth,
    requireRole("Admin", "Laboratory Staff", "Student"),
    bookingController.getBookedDates
);

// Create a booking
router.post(
    "/",
    requireAuth,
    requireRole("Admin", "Laboratory Staff", "Student"),
    bookingController.createBooking
);

// Only Admin can manually update booking status
router.patch(
    "/:booking_id/status",
    requireAuth,
    requireRole("Admin"),
    bookingController.updateBookingStatus
);

module.exports = router;