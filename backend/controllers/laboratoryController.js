const pool = require('../config/db');

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const fail = (res, msg, status = 500) => res.status(status).json({ success: false, error: { message: msg } });
const validate = ({ lab_name, location, capacity, type_id, status_id }) => 
  !lab_name || !location || capacity == null || type_id == null || status_id == null;

const LAB_JOIN = `SELECT l.*, lt.type_name, ls.status_name FROM laboratories l 
  JOIN lab_types lt ON l.type_id = lt.id 
  JOIN lab_statuses ls ON l.status_id = ls.id`;

exports.getAllLabs = async (req, res) => {
  try {
    const [rows] = await pool.query(LAB_JOIN);
    ok(res, rows);
  } catch (err) { fail(res, err.message); }
};


exports.getUnavailableLabs = async (req, res) => {
  try {
    const [rows] = await pool.query(`${LAB_JOIN} WHERE ls.status_name IN ('Maintenance', 'Unavailable')`);
    ok(res, rows);
  } catch (err) { fail(res, err.message); }
};


exports.getLabById = async (req, res) => {
  try {
    const [rows] = await pool.query(`${LAB_JOIN} WHERE l.id = ?`, [req.params.id]);
    if (!rows.length) return fail(res, 'Lab not found', 404);
    ok(res, rows[0]);
  } catch (err) { fail(res, err.message); }
};


exports.createLab = async (req, res) => {
  if (validate(req.body)) return fail(res, 'Missing fields', 400);
  try {
    const { lab_name, location, capacity, type_id, status_id } = req.body;
    const [result] = await pool.query(
      `INSERT INTO laboratories (lab_name, location, capacity, type_id, status_id) VALUES (?, ?, ?, ?, ?)`,
      [lab_name, location, capacity, type_id, status_id]
    );
    ok(res, { id: result.insertId, ...req.body }, 201);
  } catch (err) { fail(res, err.message); }
};


exports.updateLab = async (req, res) => {
  if (validate(req.body)) return fail(res, 'Missing fields', 400);
  try {
    const { lab_name, location, capacity, type_id, status_id } = req.body;
    const [result] = await pool.query(
      `UPDATE laboratories SET lab_name=?, location=?, capacity=?, type_id=?, status_id=? WHERE id=?`,
      [lab_name, location, capacity, type_id, status_id, req.params.id]
    );
    if (!result.affectedRows) return fail(res, 'Lab not found', 404);
    ok(res, { id: req.params.id, ...req.body });
  } catch (err) { fail(res, err.message); }
};


exports.deleteLab = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM laboratories WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return fail(res, 'Lab not found', 404);
    res.status(204).send();
  } catch (err) { fail(res, err.message); }
};