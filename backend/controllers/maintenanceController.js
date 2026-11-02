const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM equipment');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM maintenance_reports');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRecords = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM maintenance_records');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStatuses = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM maintenance_statuses');
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

exports.createRecord = async (req, res) => {
    try {
        const { request_id, work_performed, technician } = req.body;
        const [result] = await db.query(
            'INSERT INTO maintenance_records (request_id, work_performed, technician) VALUES (?, ?, ?)',
            [request_id, work_performed, technician]
        );
        res.status(201).json({ id: result.insertId, message: 'Work logged successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createStatus = async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await db.query(
            'INSERT INTO maintenance_statuses (name, description) VALUES (?, ?)',
            [name, description]
        );
        res.status(201).json({ id: result.insertId, message: 'Status added successfully' });
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

exports.updateRequest = async (req, res) => {
    try {
        const { description, status } = req.body;
        await db.query('UPDATE maintenance_reports SET description = ?, status = ? WHERE id = ?', [description, status, req.params.id]);
        res.json({ message: 'Request updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateRecord = async (req, res) => {
    try {
        const { work_performed, technician } = req.body;
        await db.query('UPDATE maintenance_records SET work_performed = ?, technician = ? WHERE id = ?', [work_performed, technician, req.params.id]);
        res.json({ message: 'Record updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStatusDefinition = async (req, res) => {
    try {
        const { name, description } = req.body;
        await db.query('UPDATE maintenance_statuses SET name = ?, description = ? WHERE id = ?', [name, description, req.params.id]);
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

exports.deleteRecord = async (req, res) => {
    try {
        await db.query('DELETE FROM maintenance_records WHERE id = ?', [req.params.id]);
        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStatus = async (req, res) => {
    try {
        await db.query('DELETE FROM maintenance_statuses WHERE id = ?', [req.params.id]);
        res.json({ message: 'Status deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};