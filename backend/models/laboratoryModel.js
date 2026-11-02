const pool = require('../config/db');

const LAB_JOIN = `SELECT l.*, lt.type_name, ls.status_name FROM laboratories l 
  JOIN lab_types lt ON l.type_id = lt.type_id 
  JOIN lab_statuses ls ON l.status_id = ls.status_id`;


exports.getAllLabs = async () => {
  const [rows] = await pool.query(`${LAB_JOIN} ORDER BY l.lab_id ASC`);
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
  
  if (result.affectedRows === 0) {
    return null;
  }

  return await exports.getLabById(id);
};

exports.deleteLab = async (id) => {
  const [result] = await pool.query('DELETE FROM laboratories WHERE lab_id = ?', [id]);
  return result.affectedRows > 0;
};


exports.existsByName = async (lab_name, excludeId = null) => {
  try {
    let query;
    let params;
    
    if (excludeId) {
      query = `SELECT lab_id FROM laboratories WHERE lab_name = ? AND lab_id != ?`;
      params = [lab_name, excludeId];
    } else {
      query = `SELECT lab_id FROM laboratories WHERE lab_name = ?`;
      params = [lab_name];
    }
    
    const [rows] = await pool.query(query, params);
    return rows.length > 0;
  } catch (err) {
    console.error('Error checking lab name:', err);
    throw err;
  }
};

exports.validateForeignKeys = async (type_id, status_id) => {
  try {
    const [validTypes] = await pool.query('SELECT COUNT(*) as count FROM lab_types WHERE type_id = ?', [type_id]);
    if (validTypes[0].count === 0) {
      return { valid: false, message: 'Invalid type_id provided' };
    }

    const [validStatuses] = await pool.query('SELECT COUNT(*) as count FROM lab_statuses WHERE status_id = ?', [status_id]);
    if (validStatuses[0].count === 0) {
      return { valid: false, message: 'Invalid status_id provided' };
    }

    return { valid: true };
  } catch (err) {
    console.error('Error validating foreign keys:', err);
    throw err;
  }
};