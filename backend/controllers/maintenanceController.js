const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT m.*, e.name AS equipment_name, ms.name AS status_name 
            FROM maintenance_requests m
            LEFT JOIN equipment e ON m.equipment_id = e.id
            LEFT JOIN maintenance_statuses ms ON m.maintenance_status_id = ms.id
        `);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching maintenance requests:', error);
        return res.status(500).json({ message: 'Failed to retrieve maintenance requests.' });
    }
};

exports.create = async (req, res) => {
    try {
        const { equipment_id, maintenance_status_id, description } = req.body;
        const [result] = await db.execute(`
            INSERT INTO maintenance_requests (equipment_id, maintenance_status_id, description, status) 
            VALUES (?, ?, ?, 'Pending')
        `, [equipment_id, maintenance_status_id, description]);
        
        return res.status(201).json({ id: result.insertId, message: 'Maintenance request created successfully.' });
    } catch (error) {
        console.error('Error creating maintenance request:', error);
        return res.status(500).json({ message: 'Failed to create maintenance request.' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.execute('UPDATE maintenance_requests SET status = ? WHERE id = ?', [status, id]);
        return res.status(200).json({ message: 'Status updated successfully.' });
    } catch (error) {
        console.error('Error updating status:', error);
        return res.status(500).json({ message: 'Failed to update status.' });
    }
};

exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM maintenance_requests WHERE id = ?', [id]);
        return res.status(200).json({ message: 'Maintenance request deleted successfully.' });
    } catch (error) {
        console.error('Error deleting maintenance request:', error);
        return res.status(500).json({ message: 'Failed to delete maintenance request.' });
    }
};