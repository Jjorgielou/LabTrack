const pool = require('../config/db');

exports.getAllCourses = async () => {
    const [rows] = await pool.query(`
        SELECT
            c.course_id,
            c.course_name,
            c.course_code,
            c.department_id,
            d.department_name,
            c.created_at
        FROM courses c
        JOIN departments d
            ON c.department_id = d.department_id
        ORDER BY c.course_name ASC
    `);

    return rows;
};

exports.getCourseById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            c.course_id,
            c.course_name,
            c.course_code,
            c.department_id,
            d.department_name,
            c.created_at
        FROM courses c
        JOIN departments d
            ON c.department_id = d.department_id
        WHERE c.course_id = ?
    `, [id]);

    return rows[0] || null;
};

exports.createCourse = async ({
    course_name,
    course_code,
    department_id
}) => {
    const [result] = await pool.query(
        `INSERT INTO courses
            (course_name, course_code, department_id)
         VALUES (?, ?, ?)`,
        [course_name, course_code, department_id]
    );

    return exports.getCourseById(result.insertId);
};

exports.deleteCourse = async (id) => {
    const [result] = await pool.query(
        'DELETE FROM courses WHERE course_id = ?',
        [id]
    );

    return result.affectedRows > 0;
};
