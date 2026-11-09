const db = require('../config/db');

const maintenanceModel = {
    async getAllRecords() {
        const [rows] = await db.query(`
            SELECT 
                mr.*, 
                ms.name AS status_name, 
                e.name AS equipment_name
            FROM maintenance_requests mr
            LEFT JOIN maintenance_statuses ms ON mr.maintenance_status_id = ms.id
            LEFT JOIN equipment e ON mr.equipment_id = e.id
        `);
        return rows;
    },

    async createRecord(data) {
        const { equipment_id, maintenance_status_id, description } = data;
        const [result] = await db.query(
            `INSERT INTO maintenance_requests (equipment_id, maintenance_status_id, description) VALUES (?, ?, ?)`,
            [equipment_id, maintenance_status_id, description]
        );
        return result.insertId;
    },

    async updateStatus(id, maintenance_status_id) {
        const [result] = await db.query(
            `UPDATE maintenance_requests SET maintenance_status_id = ? WHERE id = ?`,
            [maintenance_status_id, id]
        );
        return result.affectedRows;
    },

    async deleteRecord(id) {
        const [result] = await db.query(
            `DELETE FROM maintenance_requests WHERE id = ?`,
            [id]
        );
        return result.affectedRows;
    }
};

module.exports = maintenanceModel;