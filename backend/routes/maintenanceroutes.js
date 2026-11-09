const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all records
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM maintenance_records');
        res.status(200).json(rows);
    } catch (err) {
        console.error("Maintenance Fetch Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST create record
router.post('/', async (req, res) => {
    try {
        const equipment_id = req.body.equipment_id;
        const maintenance_status_id = req.body.maintenance_status_id || req.body['maintenance status id'];
        const description = req.body.description;

        if (!equipment_id || !maintenance_status_id) {
            return res.status(400).json({ error: "equipment_id and maintenance_status_id are required" });
        }

        const query = `
            INSERT INTO maintenance_records (equipment_id, maintenance_status_id, description)
            VALUES (?, ?, ?)
        `;

        await db.query(query, [equipment_id, maintenance_status_id, description]);
        res.status(201).json({ message: "Maintenance record created successfully" });
    } catch (err) {
        console.error("Maintenance Insert Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT update status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const maintenance_status_id = req.body.maintenance_status_id || req.body['maintenance status id'];

        if (!maintenance_status_id) {
            return res.status(400).json({ error: "maintenance_status_id is required" });
        }

        const [result] = await db.query(
            'UPDATE maintenance_records SET maintenance_status_id = ? WHERE id = ?',
            [maintenance_status_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Maintenance record not found" });
        }

        res.json({ message: "Maintenance status updated successfully" });
    } catch (err) {
        console.error("Maintenance Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// DELETE remove record
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query(
            'DELETE FROM maintenance_records WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Maintenance record not found" });
        }

        res.json({ message: "Maintenance record deleted successfully" });
    } catch (err) {
        console.error("Maintenance Delete Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;