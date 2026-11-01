
const {
    getAllSchedules,
    createSchedule
} = require("../models/scheduleModel");

exports.getAllSchedules = async (req, res) => {
    try {
        const results = await getAllSchedules();

        res.status(200).json({
            success: true,
            data: results,
            count: results.length
        });

    } catch (err) {
        console.error("Error retrieving schedules:", err);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve schedules."
        });
    }
};

exports.createSchedule = async (req, res) => {
    try {
        const {
            lab_id,
            schedule_date,
            start_time,
            end_time
        } = req.body;

        if (
            !lab_id ||
            !schedule_date ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields."
            });
        }

        if (end_time <= start_time) {
            return res.status(400).json({
                success: false,
                message: "End time must be later than start time."
            });
        }

        const scheduleData = {
            lab_id,
            schedule_date,
            start_time,
            end_time
        };

        const result = await createSchedule(scheduleData);

        res.status(201).json({
            success: true,
            message: "Schedule created successfully!",
            schedule_id: result.insertId
        });

    } catch (err) {
        console.error("Error creating schedule:", err);

        res.status(500).json({
            success: false,
            message: "Failed to create schedule."
        });
    }
};
