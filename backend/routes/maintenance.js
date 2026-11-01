const express = require('express');
const router = express.Router();
const db = require('../config/db'); // or '../db' depending on your folder structure

// MUST use '/' here because /api/maintenance is already set in app.js
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM maintenance_requests');
        res.json(rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;