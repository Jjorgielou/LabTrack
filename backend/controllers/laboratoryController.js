const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'CORTIS123',
  database: 'labtrack'
});

exports.getAllLabs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.*, lt.type_name, ls.status_name
      FROM laboratories l
      JOIN lab_types lt ON l.type_id = lt.type_id
      JOIN lab_statuses ls ON l.status_id = ls.status_id
    `);
    res.status(200).json({
      success: true,
      data: rows,
      meta: {
        timestamp: new Date().toISOString(),
        count: rows.length
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
};

exports.getLabById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, lt.type_name, ls.status_name
       FROM laboratories l
       JOIN lab_types lt ON l.type_id = lt.type_id
       JOIN lab_statuses ls ON l.status_id = ls.status_id
       WHERE l.lab_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lab not found.' }
      });
    }
    res.status(200).json({
      success: true,
      data: rows[0],
      meta: { timestamp: new Date().toISOString(), count: 1 }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
};

exports.createLab = async (req, res) => {
  try {
    const { lab_name, location, capacity, type_id, status_id } = req.body;

    if (!lab_name || !location || capacity == null || type_id == null || status_id == null) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Required fields are missing.' }
      });
    }

    const [result] = await pool.query(
      `INSERT INTO laboratories (lab_name, location, capacity, type_id, status_id)
       VALUES (?, ?, ?, ?, ?)`,
      [lab_name, location, capacity, type_id, status_id]
    );

    const newLab = {
      lab_id: result.insertId,
      lab_name,
      location,
      capacity,
      type_id,
      status_id
    };

    res.status(201).json({
      success: true,
      data: newLab,
      meta: { timestamp: new Date().toISOString(), count: 1 }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
};

exports.deleteLab = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM laboratories WHERE lab_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lab not found.' }
      });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message }
    });
  }
};