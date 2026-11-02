const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM equipment');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { equipment_id, description } = req.body;
        const [result] = await db.query(
            'INSERT INTO maintenance_reports (equipment_id, description, status) VALUES (?, ?, ?)',
            [equipment_id, description, 'Pending']
        );
        res.status(201).json({ id: result.insertId, message: 'Submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE maintenance_reports SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.remove = async (req, res) => {
    try {
        await db.query('DELETE FROM maintenance_reports WHERE id = ?', [req.params.id]);
        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};