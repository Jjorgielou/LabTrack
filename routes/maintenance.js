const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all maintenance requests
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM maintenance_requests ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error("GET Error:", err); // Added for debugging
    res.status(500).json({ error: err.message || err });
  }
});

// POST a new maintenance request
router.post('/', async (req, res) => {
  const { equipment_id, reported_problem } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO maintenance_requests (equipment_id, reported_problem) VALUES (?, ?)',
      [equipment_id, reported_problem]
    );
    res.status(201).json({ id: result.insertId, equipment_id, reported_problem, status: 'Pending' });
  } catch (err) {
    console.error("POST Error:", err); // Added for debugging
    res.status(500).json({ error: err.message || err });
  }
});

module.exports = router;