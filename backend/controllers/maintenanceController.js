const db = require('../config/db');

exports.getMaintenance = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM maintenance_requests');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createMaintenance = async (req, res) => {
    try {
        const { equipment, description, status_id } = req.body;
        await db.query(
            'INSERT INTO maintenance_requests (equipment_name, description, status_id) VALUES (?, ?, ?)',
            [equipment, description, status_id]
        );
        res.json({ success: true, message: 'Maintenance request created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteMaintenance = async (req, res) => {
    try {
        await db.query('DELETE FROM maintenance_requests WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Maintenance request deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};