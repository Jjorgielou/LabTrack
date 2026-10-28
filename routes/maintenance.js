const express = require('express');
const router = express.Router();
const db = require('../db');

// GET maintenance requests
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM maintenance_requests ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error("GET Error:", err);
    res.status(500).json({ error: err.message || err });
  }
});

// POST new maintenance request
router.post('/', async (req, res) => {
  const { equipment_id, reported_problem } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO maintenance_requests (equipment_id, reported_problem) VALUES (?, ?)',
      [equipment_id, reported_problem]
    );
    res.status(201).json({ id: result.insertId, equipment_id, reported_problem, status: 'Pending' });
  } catch (err) {
    console.error("POST Error:", err);
    res.status(500).json({ error: err.message || err });
  }
});

// Update maintenance status
router.put('/:id', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  try {
    await db.query('UPDATE maintenance_requests SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Maintenance status updated successfully' });
  } catch (err) {
    console.error("PUT Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete maintenance request
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM maintenance_requests WHERE id = ?', [id]);
    res.json({ message: 'Maintenance request deleted successfully' });
  } catch (err) {
    console.error("DELETE Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;