
const db = require("../config/db");

// GET /api/maintenance
// Returns equipment for the maintenance page.
exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM equipment ORDER BY equipment_id DESC"
        );

        res.json(rows);
    } catch (err) {
        console.error("Error fetching equipment:", err);
        res.status(500).json({
            message: "Failed to retrieve equipment."
        });
    }
};

// GET /api/maintenance/requests
exports.getRequests = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                mr.*,
                e.equipment_name AS equipment_name
            FROM maintenance_requests mr
            LEFT JOIN equipment e
                ON mr.equipment_id = e.equipment_id
            ORDER BY mr.id DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error("Error fetching maintenance requests:", err);
        res.status(500).json({
            message: "Failed to retrieve maintenance requests."
        });
    }
};

// GET /api/maintenance/records
exports.getRecords = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                mr.*,
                requests.equipment_id,
                requests.description AS request_description
            FROM maintenance_records mr
            LEFT JOIN maintenance_requests requests
                ON mr.request_id = requests.id
            ORDER BY mr.id DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error("Error fetching maintenance records:", err);
        res.status(500).json({
            message: "Failed to retrieve maintenance records."
        });
    }
};

// GET /api/maintenance/statuses
exports.getStatuses = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM maintenance_statuses ORDER BY id ASC"
        );

        res.json(rows);
    } catch (err) {
        console.error("Error fetching maintenance statuses:", err);
        res.status(500).json({
            message: "Failed to retrieve maintenance statuses."
        });
    }
};

// POST /api/maintenance
exports.create = async (req, res) => {
    try {
        const { equipment_id, description } = req.body;

        if (!equipment_id || !description?.trim()) {
            return res.status(400).json({
                message: "Equipment and description are required."
            });
        }

        const [result] = await db.query(
            `INSERT INTO maintenance_requests
                (equipment_id, description, status)
             VALUES (?, ?, ?)`,
            [equipment_id, description.trim(), "Pending"]
        );

        res.status(201).json({
            id: result.insertId,
            message: "Maintenance request submitted successfully."
        });
    } catch (err) {
        console.error("Error creating maintenance request:", err);
        res.status(500).json({
            message: "Failed to submit maintenance request."
        });
    }
};

// POST /api/maintenance/records
exports.createRecord = async (req, res) => {
    try {
        const { request_id, work_performed, technician } = req.body;

        if (!request_id || !work_performed?.trim() || !technician?.trim()) {
            return res.status(400).json({
                message: "Request, work performed, and technician are required."
            });
        }

        const [result] = await db.query(
            `INSERT INTO maintenance_records
                (request_id, work_performed, technician)
             VALUES (?, ?, ?)`,
            [request_id, work_performed.trim(), technician.trim()]
        );

        res.status(201).json({
            id: result.insertId,
            message: "Maintenance record created successfully."
        });
    } catch (err) {
        console.error("Error creating maintenance record:", err);
        res.status(500).json({
            message: "Failed to create maintenance record."
        });
    }
};

// POST /api/maintenance/statuses
exports.createStatus = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                message: "Status name is required."
            });
        }

        const [result] = await db.query(
            `INSERT INTO maintenance_statuses (name, description)
             VALUES (?, ?)`,
            [name.trim(), description?.trim() || null]
        );

        res.status(201).json({
            id: result.insertId,
            message: "Maintenance status added successfully."
        });
    } catch (err) {
        console.error("Error creating maintenance status:", err);
        res.status(500).json({
            message: "Failed to create maintenance status."
        });
    }
};

// PUT /api/maintenance/:id
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status?.trim()) {
            return res.status(400).json({
                message: "Status is required."
            });
        }

        const [result] = await db.query(
            "UPDATE maintenance_requests SET status = ? WHERE id = ?",
            [status.trim(), req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance request not found."
            });
        }

        res.json({
            message: "Maintenance request status updated successfully."
        });
    } catch (err) {
        console.error("Error updating maintenance request status:", err);
        res.status(500).json({
            message: "Failed to update maintenance request status."
        });
    }
};

// PUT /api/maintenance/requests/:id
exports.updateRequest = async (req, res) => {
    try {
        const { description, status } = req.body;

        if (!description?.trim() || !status?.trim()) {
            return res.status(400).json({
                message: "Description and status are required."
            });
        }

        const [result] = await db.query(
            `UPDATE maintenance_requests
             SET description = ?, status = ?
             WHERE id = ?`,
            [description.trim(), status.trim(), req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance request not found."
            });
        }

        res.json({
            message: "Maintenance request updated successfully."
        });
    } catch (err) {
        console.error("Error updating maintenance request:", err);
        res.status(500).json({
            message: "Failed to update maintenance request."
        });
    }
};

// PUT /api/maintenance/records/:id
exports.updateRecord = async (req, res) => {
    try {
        const { work_performed, technician } = req.body;

        if (!work_performed?.trim() || !technician?.trim()) {
            return res.status(400).json({
                message: "Work performed and technician are required."
            });
        }

        const [result] = await db.query(
            `UPDATE maintenance_records
             SET work_performed = ?, technician = ?
             WHERE id = ?`,
            [work_performed.trim(), technician.trim(), req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance record not found."
            });
        }

        res.json({
            message: "Maintenance record updated successfully."
        });
    } catch (err) {
        console.error("Error updating maintenance record:", err);
        res.status(500).json({
            message: "Failed to update maintenance record."
        });
    }
};

// PUT /api/maintenance/statuses/:id
exports.updateStatusDefinition = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                message: "Status name is required."
            });
        }

        const [result] = await db.query(
            `UPDATE maintenance_statuses
             SET name = ?, description = ?
             WHERE id = ?`,
            [name.trim(), description?.trim() || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance status not found."
            });
        }

        res.json({
            message: "Maintenance status updated successfully."
        });
    } catch (err) {
        console.error("Error updating maintenance status:", err);
        res.status(500).json({
            message: "Failed to update maintenance status."
        });
    }
};

// DELETE /api/maintenance/:id
exports.remove = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM maintenance_requests WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance request not found."
            });
        }

        res.json({
            message: "Maintenance request deleted successfully."
        });
    } catch (err) {
        console.error("Error deleting maintenance request:", err);
        res.status(500).json({
            message: "Failed to delete maintenance request."
        });
    }
};

// DELETE /api/maintenance/records/:id
exports.deleteRecord = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM maintenance_records WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance record not found."
            });
        }

        res.json({
            message: "Maintenance record deleted successfully."
        });
    } catch (err) {
        console.error("Error deleting maintenance record:", err);
        res.status(500).json({
            message: "Failed to delete maintenance record."
        });
    }
};

// DELETE /api/maintenance/statuses/:id
exports.deleteStatus = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM maintenance_statuses WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance status not found."
            });
        }

        res.json({
            message: "Maintenance status deleted successfully."
        });
    } catch (err) {
        console.error("Error deleting maintenance status:", err);
        res.status(500).json({
            message: "Failed to delete maintenance status."
        });
    }
};
