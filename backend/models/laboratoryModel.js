// backend/models/laboratoryModel.js

const pool = require('../config/db');

const LAB_JOIN = `
  SELECT l.*, lt.type_name, ls.status_name
  FROM laboratories l
  JOIN lab_types    lt ON l.type_id   = lt.type_id
  JOIN lab_statuses ls ON l.status_id = ls.status_id`;

exports.getAllLabs = async () => {
  const [rows] = await pool.query(`${LAB_JOIN} ORDER BY ls.status_name ASC, l.lab_id ASC`);
  return rows;
};

exports.getUnavailableLabs = async () => {
  const [rows] = await pool.query(
    `${LAB_JOIN} WHERE ls.status_name IN ('Maintenance', 'Unavailable') ORDER BY l.lab_id ASC`
  );
  return rows;
};

exports.getLabById = async (id) => {
  const [rows] = await pool.query(`${LAB_JOIN} WHERE l.lab_id = ?`, [id]);
  return rows[0] || null;
};

exports.createLab = async ({ lab_name, location, capacity, type_id, status_id }) => {
  const [result] = await pool.query(
    `INSERT INTO laboratories (lab_name, location, capacity, type_id, status_id)
     VALUES (?, ?, ?, ?, ?)`,
    [lab_name, location, capacity, type_id, status_id]
  );
  return await exports.getLabById(result.insertId);
};

exports.updateLab = async (id, { lab_name, location, capacity, type_id, status_id }) => {
  const [result] = await pool.query(
    `UPDATE laboratories
        SET lab_name = ?, location = ?, capacity = ?, type_id = ?, status_id = ?
      WHERE lab_id = ?`,
    [lab_name, location, capacity, type_id, status_id, id]
  );
  if (result.affectedRows === 0) return null;
  return await exports.getLabById(id);
};

exports.deleteLab = async (id) => {
  const [result] = await pool.query('DELETE FROM laboratories WHERE lab_id = ?', [id]);
  return result.affectedRows > 0;
};

exports.existsByName = async (lab_name, excludeId = null) => {
  const sql = excludeId
    ? 'SELECT lab_id FROM laboratories WHERE lab_name = ? AND lab_id <> ? LIMIT 1'
    : 'SELECT lab_id FROM laboratories WHERE lab_name = ? LIMIT 1';
  const params = excludeId ? [lab_name, excludeId] : [lab_name];
  const [rows] = await pool.query(sql, params);
  return rows.length > 0;
};

exports.validateForeignKeys = async (type_id, status_id) => {
  const [[{ typeCount }]] = await pool.query(
    'SELECT COUNT(*) AS typeCount FROM lab_types WHERE type_id = ?', [type_id]
  );
  if (!typeCount) return { valid: false, message: 'Invalid type_id provided.' };

  const [[{ statusCount }]] = await pool.query(
    'SELECT COUNT(*) AS statusCount FROM lab_statuses WHERE status_id = ?', [status_id]
  );
  if (!statusCount) return { valid: false, message: 'Invalid status_id provided.' };

  return { valid: true };
};