const express = require("express");
const router = express.Router();

const scheduleController = require("../controllers/scheduleController");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.get(
    "/",
    requireAuth,
    requireRole("Admin", "Laboratory Staff", "Student"),
    scheduleController.getAllSchedules
);

router.post(
    "/",
    requireAuth,
    requireRole("Admin", "Laboratory Staff"),
    scheduleController.createSchedule
);

module.exports = router;