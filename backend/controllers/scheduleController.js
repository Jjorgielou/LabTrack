const {
    getAllSchedules,
    createSchedule
} = require("../models/scheduleModel");

function isValidDate(date) {
    if (typeof date !== "string") return false;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00Z`);

    return !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date;
}

function isValidTime(time) {
    return typeof time === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time);
}

exports.getAllSchedules = async (req, res) => {
    try {
        const results = await getAllSchedules();

        return res.status(200).json({
            success: true,
            data: results,
            count: results.length
        });

    } catch (err) {
        console.error("Error retrieving schedules:", err);

        return res.status(500).json({
            success: false,
            error: {
                code: "SERVER_ERROR",
                message: "Failed to retrieve schedules."
            }
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
            lab_id === undefined ||
            !schedule_date ||
            !start_time ||
            !end_time
        ) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Please provide all required fields."
                }
            });
        }

       if (
            !/^[1-9]\d*$/.test(String(lab_id))
        ){
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Laboratory ID must be a positive integer."
                }
            });
        }

        if (!isValidDate(schedule_date)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Please provide a valid date in YYYY-MM-DD format."
                }
            });
        }

        if (!isValidTime(start_time) || !isValidTime(end_time)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Please provide valid times in HH:MM or HH:MM:SS format."
                }
            });
        }

        const normalizedStart = start_time.length === 5
            ? `${start_time}:00`
            : start_time;

        const normalizedEnd = end_time.length === 5
            ? `${end_time}:00`
            : end_time;

        if (normalizedEnd <= normalizedStart) {

            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "End time must be later than start time."
                }
            });
        }

        const scheduleData = {
            lab_id: Number(lab_id),
            schedule_date,
            start_time: normalizedStart,
            end_time: normalizedEnd
        };

        const result = await createSchedule(scheduleData);

        if (result.labNotFound) {
            return res.status(404).json({
                success: false,
                error: {
                    code: "LAB_NOT_FOUND",
                    message: "Laboratory not found."
                }
            });
        }

        if (result.conflict) {
            return res.status(409).json({
                success: false,
                error: {
                    code: "SCHEDULE_CONFLICT",
                    message: "This schedule overlaps with an existing schedule."
                }
            });
        }

        return res.status(201).json({
            success: true,
            message: "Schedule created successfully.",
            data: {
                schedule_id: result.insertId
            }
        });

    } catch (err) {
        console.error("Error creating schedule:", err);

        return res.status(500).json({
            success: false,
            error: {
                code: "SERVER_ERROR",
                message: "Failed to create schedule."
            }
        });
    }
};
