const db = require('../config/db');

const Maintenance = {
    getAllRequests: async () => {
        const [rows] = await db.query('SELECT * FROM maintenance_requests');
        return rows;
    },
    createRequest: async (data) => {
        const { equipment_id, description, status } = data;
        const [result] = await db.query(
            'INSERT INTO maintenance_requests (equipment_id, description, status) VALUES (?, ?, ?)',
            [equipment_id, description, status]
        );
        return result.insertId;
    },
    updateRequest: async (id, data) => {
        const { equipment_id, description, status } = data;
        await db.query(
            'UPDATE maintenance_requests SET equipment_id = ?, description = ?, status = ? WHERE id = ?',
            [equipment_id, description, status, id]
        );
    },
    deleteRequest: async (id) => {
        await db.query('DELETE FROM maintenance_requests WHERE id = ?', [id]);
    },

    getAllRecords: async () => {
        const [rows] = await db.query('SELECT * FROM maintenance_records');
        return rows;
    },
    createRecord: async (data) => {
        const { request_id, work_performed, technician } = data;
        const [result] = await db.query(
            'INSERT INTO maintenance_records (request_id, work_performed, technician) VALUES (?, ?, ?)',
            [request_id, work_performed, technician]
        );
        return result.insertId;
    },
    updateRecord: async (id, data) => {
        const { request_id, work_performed, technician } = data;
        await db.query(
            'UPDATE maintenance_records SET request_id = ?, work_performed = ?, technician = ? WHERE id = ?',
            [request_id, work_performed, technician, id]
        );
    },
    deleteRecord: async (id) => {
        await db.query('DELETE FROM maintenance_records WHERE id = ?', [id]);
    },

    getAllStatuses: async () => {
        const [rows] = await db.query('SELECT * FROM maintenance_statuses');
        return rows;
    },
    createStatus: async (data) => {
        const { name, description } = data;
        const [result] = await db.query(
            'INSERT INTO maintenance_statuses (name, description) VALUES (?, ?)',
            [name, description]
        );
        return result.insertId;
    },
    updateStatus: async (id, data) => {
        const { name, description } = data;
        await db.query(
            'UPDATE maintenance_statuses SET name = ?, description = ? WHERE id = ?',
            [name, description, id]
        );
    },
    deleteStatus: async (id) => {
        await db.query('DELETE FROM maintenance_statuses WHERE id = ?', [id]);
    }
};

module.exports = Maintenance;