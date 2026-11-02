
const pool = require("../config/db");

async function getAllSchedules() {
    const [results] = await pool.query(
        `SELECT
            s.*,
            l.lab_name,
            l.location AS lab_location
         FROM schedules s
         INNER JOIN laboratories l
            ON s.lab_id = l.lab_id
         ORDER BY s.schedule_date, s.start_time`
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

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [labs] = await connection.query(
            `SELECT lab_id
             FROM laboratories
             WHERE lab_id = ?
             FOR UPDATE`,
            [lab_id]
        );

        if (labs.length === 0) {
            await connection.rollback();
            return { labNotFound: true };
        }

        const [conflicts] = await connection.query(
            `SELECT schedule_id
             FROM schedules
             WHERE lab_id = ?
               AND schedule_date = ?
               AND ? < end_time
               AND ? > start_time`,
            [lab_id, schedule_date, start_time, end_time]
        );

        if (conflicts.length > 0) {
            await connection.rollback();
            return { conflict: true };
        }

        const [result] = await connection.query(
            `INSERT INTO schedules
             (lab_id, schedule_date, start_time, end_time)
             VALUES (?, ?, ?, ?)`,
            [lab_id, schedule_date, start_time, end_time]
        );

        await connection.commit();

        return result;

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}

module.exports = {
    getAllSchedules,
    createSchedule
};
