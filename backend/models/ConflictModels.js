const db = require("../config/db");

// Departments
const getAllDepartments = async () => {
    const [rows] = await db.query(
        `SELECT department_id, department_name, created_at
         FROM departments
         ORDER BY department_name ASC`
    );

    return rows;
};

const createDepartment = async (department_name) => {
    const [result] = await db.query(
        `INSERT INTO departments (department_name)
         VALUES (?)`,
        [department_name]
    );

    return result;
};

const updateDepartment = async (id, department_name) => {
    const [result] = await db.query(
        `UPDATE departments
         SET department_name = ?
         WHERE department_id = ?`,
        [department_name, id]
    );

    return result;
};

const deleteDepartment = async (id) => {
    const [result] = await db.query(
        `DELETE FROM departments
         WHERE department_id = ?`,
        [id]
    );

    return result;
};

// Courses
const getAllCourses = async () => {
    const [rows] = await db.query(
        `SELECT
            c.course_id,
            c.course_name,
            c.course_code,
            c.department_id,
            d.department_name,
            c.created_at
         FROM courses c
         INNER JOIN departments d
            ON c.department_id = d.department_id
         ORDER BY c.course_name ASC`
    );

    return rows;
};

const createCourse = async (data) => {
    const [result] = await db.query(
        `INSERT INTO courses
            (course_name, course_code, department_id)
         VALUES (?, ?, ?)`,
        [
            data.course_name,
            data.course_code,
            data.department_id
        ]
    );

    return result;
};

const updateCourse = async (id, data) => {
    const [result] = await db.query(
        `UPDATE courses
         SET course_name = ?,
             course_code = ?,
             department_id = ?
         WHERE course_id = ?`,
        [
            data.course_name,
            data.course_code,
            data.department_id,
            id
        ]
    );

    return result;
};

const deleteCourse = async (id) => {
    const [result] = await db.query(
        `DELETE FROM courses
         WHERE course_id = ?`,
        [id]
    );

    return result;
};

// Conflict logs
const getAllConflicts = async () => {
    const [rows] = await db.query(
        `SELECT
            cl.*,
            b1.requested_date AS original_booking_date,
            b1.start_time AS original_start_time,
            b1.end_time AS original_end_time,
            b2.requested_date AS conflicting_booking_date,
            b2.start_time AS conflicting_start_time,
            b2.end_time AS conflicting_end_time,
            l.lab_name
         FROM conflict_logs cl
         INNER JOIN bookings b1
            ON cl.booking_id = b1.booking_id
         INNER JOIN bookings b2
            ON cl.conflict_booking_id = b2.booking_id
         INNER JOIN laboratories l
            ON cl.lab_id = l.lab_id
         ORDER BY cl.detected_at DESC`
    );

    return rows;
};

const createConflict = async (data) => {
    const [result] = await db.query(
        `INSERT INTO conflict_logs
            (booking_id, conflict_booking_id, lab_id,
             conflict_type, description)
         VALUES (?, ?, ?, ?, ?)`,
        [
            data.booking_id,
            data.conflict_booking_id,
            data.lab_id,
            data.conflict_type,
            data.description || null
        ]
    );

    return result;
};

const updateConflictStatus = async (id, status) => {
    const [result] = await db.query(
        `UPDATE conflict_logs
         SET conflict_status = ?,
             resolved_at = CASE
                 WHEN ? = 'resolved' THEN CURRENT_TIMESTAMP
                 ELSE NULL
             END
         WHERE conflict_id = ?`,
        [status, status, id]
    );

    return result;
};

const deleteConflict = async (id) => {
    const [result] = await db.query(
        `DELETE FROM conflict_logs
         WHERE conflict_id = ?`,
        [id]
    );

    return result;
};

// Notifications
const getAllNotifications = async () => {
    const [rows] = await db.query(
        `SELECT
            n.*,
            u.first_name,
            u.last_name,
            u.email,
            b.requested_date,
            b.start_time,
            b.end_time
         FROM notifications n
         INNER JOIN users u
            ON n.user_id = u.user_id
         LEFT JOIN bookings b
            ON n.booking_id = b.booking_id
         ORDER BY n.created_at DESC`
    );

    return rows;
};

const getUserNotifications = async (user_id) => {
    const [rows] = await db.query(
        `SELECT
            n.*,
            b.requested_date,
            b.start_time,
            b.end_time
         FROM notifications n
         LEFT JOIN bookings b
            ON n.booking_id = b.booking_id
         WHERE n.user_id = ?
         ORDER BY n.created_at DESC`,
        [user_id]
    );

    return rows;
};

const createNotification = async (data) => {
    const [result] = await db.query(
        `INSERT INTO notifications
            (user_id, message, notification_type, booking_id)
         VALUES (?, ?, ?, ?)`,
        [
            data.user_id,
            data.message,
            data.notification_type,
            data.booking_id ?? null
        ]
    );

    return result;
};

const deleteNotification = async (id) => {
    const [result] = await db.query(
        `DELETE FROM notifications
         WHERE notification_id = ?`,
        [id]
    );

    return result;
};

// Exports
module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,

    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,

    getAllConflicts,
    createConflict,
    updateConflictStatus,
    deleteConflict,

    getAllNotifications,
    getUserNotifications,
    createNotification,
    deleteNotification
};
