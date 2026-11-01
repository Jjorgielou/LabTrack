const pool = require('../config/db');

exports.pool = pool;

const LAB_JOIN = `SELECT l.*, lt.type_name, ls.status_name FROM laboratories l 
  JOIN lab_types lt ON l.type_id = lt.type_id 
  JOIN lab_statuses ls ON l.status_id = ls.status_id`;

exports.getAllLabs = async () => {
  const [rows] = await pool.query(LAB_JOIN);
  return rows;
};

exports.getUnavailableLabs = async () => {
  const [rows] = await pool.query(
    `${LAB_JOIN} WHERE ls.status_name IN ('Maintenance', 'Unavailable')`
  );
  return rows;
};

exports.getLabById = async (id) => {
  const [rows] = await pool.query(`${LAB_JOIN} WHERE l.lab_id = ?`, [id]);
  return rows[0] || null;
};

exports.createLab = async ({ lab_name, location, capacity, type_id, status_id }) => {
  const [result] = await pool.query(
    `INSERT INTO laboratories (lab_name, location, capacity, type_id, status_id) VALUES (?, ?, ?, ?, ?)`,
    [lab_name, location, capacity, type_id, status_id]
  );
  return { lab_id: result.insertId, lab_name, location, capacity, type_id, status_id };
};

exports.updateLab = async (id, { lab_name, location, capacity, type_id, status_id }) => {
  const [result] = await pool.query(
    `UPDATE laboratories SET lab_name=?, location=?, capacity=?, type_id=?, status_id=? WHERE lab_id=?`,
    [lab_name, location, capacity, type_id, status_id, id]
  );
  return result.affectedRows > 0;
};

exports.deleteLab = async (id) => {
  const [result] = await pool.query('DELETE FROM laboratories WHERE lab_id = ?', [id]);
  return result.affectedRows > 0;
};