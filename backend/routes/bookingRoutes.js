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

router.post(
    "/",
    requireAuth,
    requireRole("Admin", "Laboratory Staff", "Student"),
    bookingController.createBooking
);

router.patch(
    "/:booking_id/status",
    requireAuth,
    requireRole("Admin", "Laboratory Staff"),
    bookingController.updateBookingStatus
);

module.exports = router;