
const express = require("express");
const router = express.Router();

const scheduleController = require("../controllers/scheduleController");

router.get("/", scheduleController.getAllSchedules);

router.post("/", scheduleController.createSchedule);

module.exports = router;
