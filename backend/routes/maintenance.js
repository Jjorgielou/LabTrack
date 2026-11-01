const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all maintenance requests
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM maintenance_requests');
        res.json(rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST a new maintenance request
router.post('/', async (req, res) => {
    const { equipment_id, reported_problem } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO maintenance_requests (equipment_id, reported_problem, status) VALUES (?, ?, ?)',
            [equipment_id, reported_problem, 'Pending']
        );
        res.status(201).json({ 
            id: result.insertId, 
            equipment_id, 
            reported_problem, 
            status: 'Pending' 
        });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT to update request status
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query(
            'UPDATE maintenance_requests SET status = ? WHERE id = ?',
            [status, id]
        );
        res.json({ message: 'Status updated successfully', id, status });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE a maintenance request
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM maintenance_requests WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Maintenance request not found' });
        }
        res.json({ message: 'Maintenance request deleted successfully', id });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;