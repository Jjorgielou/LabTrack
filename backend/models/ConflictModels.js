const db = require("../config/db");

// Departments

const getAllDepartments = async () => {
    const [rows] = await db.query(
        "SELECT * FROM departments"
    );
    return rows;
};

const createDepartment = async (department_name) => {
    const [result] = await db.query(
        "INSERT INTO departments (department_name) VALUES (?)",
        [department_name]
    );
    return result;
};

const updateDepartment = async (id, department_name) => {
    const [result] = await db.query(
        "UPDATE departments SET department_name = ? WHERE department_id = ?",
        [department_name, id]
    );
    return result;
};

const deleteDepartment = async (id) => {
    const [result] = await db.query(
        "DELETE FROM departments WHERE department_id = ?",
        [id]
    );
    return result;
};


// Courses

const getAllCourses = async () => {
    const [rows] = await db.query(
        "SELECT * FROM courses"
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
        "DELETE FROM courses WHERE course_id = ?",
        [id]
    );
    return result;
};


// Conflict_logs

const getAllConflicts = async () => {
    const [rows] = await db.query(
        "SELECT * FROM conflict_logs"
    );
    return rows;
};

const createConflict = async (data) => {
    const [result] = await db.query(
        `INSERT INTO conflict_logs
        (booking_id, conflict_booking_id, laboratory_id,
        conflict_type, description)
        VALUES (?, ?, ?, ?, ?)`,
        [
            data.booking_id,
            data.conflict_booking_id,
            data.laboratory_id,
            data.conflict_type,
            data.description
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
        "DELETE FROM conflict_logs WHERE conflict_id = ?",
        [id]
    );
    return result;
};


// Notifications

const getAllNotifications = async () => {
    const [rows] = await db.query(
        "SELECT * FROM notifications"
    );
    return rows;
};

const getUserNotifications = async (user_id) => {
    const [rows] = await db.query(
        "SELECT * FROM notifications WHERE user_id = ?",
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
            data.booking_id
        ]
    );
    return result;
};

const deleteNotification = async (id) => {
    const [result] = await db.query(
        "DELETE FROM notifications WHERE notification_id = ?",
        [id]
    );
    return result;
};



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