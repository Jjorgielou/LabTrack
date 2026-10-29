const pool = require('../config/db');

const ok = (res, data, status = 200) => res.status(status).json({
  success: true,
  data,
  meta: { timestamp: new Date().toISOString(), count: Array.isArray(data) ? data.length : 1 }
});

const fail = (res, code, message, status) => res.status(status).json({
  success: false,
  error: { code, message }
});

const LAB_JOIN = `
  SELECT l.*, lt.type_name, ls.status_name
  FROM laboratories l
  INNER JOIN lab_types lt ON l.type_id = lt.id
  INNER JOIN lab_statuses ls ON l.status_id = ls.id`;


exports.getAllLabs = async (req, res) => {
  try {
    const [rows] = await pool.query(LAB_JOIN);
    ok(res, rows);
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message, 500);
  }
};


exports.getUnavailableLabs = async (req, res) => {
  try {
    const [rows] = await pool.query(`${LAB_JOIN} WHERE ls.status_name IN ('Maintenance', 'Inactive')`);
    ok(res, rows);
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message, 500);
  }
};


exports.getLabById = async (req, res) => {
  try {
    const [rows] = await pool.query(`${LAB_JOIN} WHERE l.id = ?`, [req.params.id]);
    if (rows.length === 0) return fail(res, 'NOT_FOUND', 'Lab not found.', 404);
    ok(res, rows[0]);
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message, 500);
  }
};


const validate = ({ lab_name, location, capacity, type_id, status_id }) =>
  !lab_name || !location || capacity == null || type_id == null || status_id == null;


exports.createLab = async (req, res) => {
  try {
    const { lab_name, location, capacity, type_id, status_id } = req.body;
    if (validate(req.body)) return fail(res, 'BAD_REQUEST', 'Required fields are missing.', 400);

    const [result] = await pool.query(
      `INSERT INTO laboratories (lab_name, location, capacity, type_id, status_id)
       VALUES (?, ?, ?, ?, ?)`,
      [lab_name, location, capacity, type_id, status_id]
    );

    ok(res, { id: result.insertId, lab_name, location, capacity, type_id, status_id }, 201);
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message, 500);
  }
};


exports.updateLab = async (req, res) => {
  try {
    const { lab_name, location, capacity, type_id, status_id } = req.body;
    if (validate(req.body)) return fail(res, 'BAD_REQUEST', 'Required fields are missing.', 400);

    const [result] = await pool.query(
      `UPDATE laboratories
       SET lab_name = ?, location = ?, capacity = ?, type_id = ?, status_id = ?
       WHERE id = ?`,
      [lab_name, location, capacity, type_id, status_id, req.params.id]
    );

    if (result.affectedRows === 0) return fail(res, 'NOT_FOUND', 'Lab not found.', 404);
    ok(res, { id: req.params.id, lab_name, location, capacity, type_id, status_id });
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message, 500);
  }
};


exports.deleteLab = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM laboratories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return fail(res, 'NOT_FOUND', 'Lab not found.', 404);
    res.status(204).send();
  } catch (err) {
    fail(res, 'SERVER_ERROR', err.message, 500);
  }
};