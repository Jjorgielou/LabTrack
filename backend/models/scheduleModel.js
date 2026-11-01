
const pool = require("../db");

async function getAllSchedules() {
    const [results] = await pool.query(
        "SELECT * FROM schedules"
    );

    return results;
}

async function createSchedule(scheduleData) {
    const {
        lab_id,
        schedule_date,
        start_time,
        end_time
    } = scheduleData;

    const sql = `
        INSERT INTO schedules
        (lab_id, schedule_date, start_time, end_time)
        VALUES (?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
        lab_id,
        schedule_date,
        start_time,
        end_time
    ]);

    return result;
}

module.exports = {
    getAllSchedules,
    createSchedule
};
