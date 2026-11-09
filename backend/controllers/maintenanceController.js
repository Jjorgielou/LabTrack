const maintenanceModel = require('../models/maintenanceModel');

const maintenanceController = {
    async getMaintenanceRecords(req, res) {
        try {
            const records = await maintenanceModel.getAllRecords();
            res.json(records);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async createRecord(req, res) {
        try {
            const insertId = await maintenanceModel.createRecord(req.body);
            res.status(201).json({ id: insertId, message: "Submitted successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { maintenance_status_id } = req.body;
            const affectedRows = await maintenanceModel.updateStatus(id, maintenance_status_id);
            if (affectedRows === 0) {
                return res.status(404).json({ error: "Record not found" });
            }
            res.json({ message: "Status updated successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async deleteRecord(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await maintenanceModel.deleteRecord(id);
            if (affectedRows === 0) {
                return res.status(404).json({ error: "Record not found" });
            }
            res.json({ message: "Record removed successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = maintenanceController;