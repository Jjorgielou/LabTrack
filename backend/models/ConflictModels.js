const db = require('../config/db');

exports.createConflict = async (data) => {
    const [result] = await db.quiry(
        'INSERT INTO conflict_logs (course_id, conflict_type, description VALUES (?,?,?)',
        [data.course_id, data.conflict_type, data.description]
    );
    return result;
};

exports.getAll = async () => {
    const [rows] = await db.quiry('SELECT * FROM conflict_logs');
    return rows;
};