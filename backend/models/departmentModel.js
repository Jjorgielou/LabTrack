const pool = require('../config/db');

exports.getAllDepartments = async () => {
    const [rows] = await pool.query(
        'SELECT * FROM departments ORDER BY department_name ASC'
    );
    return rows;
};

exports.getDepartmentById = async (id) => {
    const [rows] = await pool.query(
        'SELECT * FROM departments WHERE department_id = ?',
        [id]
    );
    return rows[0] || null;
};

exports.createDepartment = async (department_name) => {
    const [result] = await pool.query(
        'INSERT INTO departments (department_name) VALUES (?)',
        [department_name]
    );
    return exports.getDepartmentById(result.insertId);
};

exports.deleteDepartment = async (id) => {
    const [result] = await pool.query(
        'DELETE FROM departments WHERE department_id = ?',
        [id]
    );
    return result.affectedRows > 0;
};
