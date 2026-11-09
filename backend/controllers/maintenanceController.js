const Maintenance = require("../models/maintenanceModel");

// Check if an ID is a valid positive number.
const isValidId = (id) => {
    return Number.isInteger(Number(id)) && Number(id) > 0;
};

// Send a general server error response.
const handleError = (res, error) => {
    console.error("Maintenance Module Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            message: "This record already exists."
        });
    }

    if (
        error.code === "ER_NO_REFERENCED_ROW_2" ||
        error.code === "ER_ROW_IS_REFERENCED_2"
    ) {
        return res.status(400).json({
            message: "The selected record is invalid or is still being used."
        });
    }

    return res.status(500).json({
        message: "An error occurred in the maintenance module."
    });
};

// MAINTENANCE REQUESTS
// GET /api/maintenance/requests
exports.getRequests = async (req, res) => {
    try {
        const requests = await Maintenance.getAllRequests();

        return res.status(200).json(requests);

    } catch (error) {
        return handleError(res, error);
    }
};


// POST /api/maintenance/requests
exports.createRequest = async (req, res) => {
    try {
        const { equipment_id, description } = req.body;

        if (
            !isValidId(equipment_id) ||
            typeof description !== "string" ||
            !description.trim()
        ) {
            return res.status(400).json({
                message: "A valid equipment ID and description are required."
            });
        }

        const data = {
            equipment_id: Number(equipment_id),
            description: description.trim(),
            status: "Pending"
        };

        const result = await Maintenance.createRequest(data);

        return res.status(201).json({
            message: "Maintenance request created successfully.",
            id: result.insertId,
            ...data
        });

    } catch (error) {
        return handleError(res, error);
    }
};


// PUT /api/maintenance/requests/:id
exports.updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, status } = req.body;

        if (
            !isValidId(id) ||
            typeof description !== "string" ||
            !description.trim() ||
            typeof status !== "string" ||
            !status.trim()
        ) {
            return res.status(400).json({
                message: "A valid request ID, description, and status are required."
            });
        }

        const result = await Maintenance.updateRequest(id, {
            description: description.trim(),
            status: status.trim()
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance request not found."
            });
        }

        return res.status(200).json({
            message: "Maintenance request updated successfully."
        });

    } catch (error) {
        return handleError(res, error);
    }
};


// DELETE /api/maintenance/requests/:id
exports.deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid maintenance request ID."
            });
        }

        const result = await Maintenance.deleteRequest(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance request not found."
            });
        }

        return res.status(200).json({
            message: "Maintenance request deleted successfully."
        });

    } catch (error) {
        return handleError(res, error);
    }
};

// MAINTENANCE RECORDS
// GET /api/maintenance/records
exports.getRecords = async (req, res) => {
    try {
        const records = await Maintenance.getAllRecords();

        return res.status(200).json(records);

    } catch (error) {
        return handleError(res, error);
    }
};


// POST /api/maintenance/records
exports.createRecord = async (req, res) => {
    try {
        const {
            request_id,
            work_performed,
            technician
        } = req.body;

        if (
            !isValidId(request_id) ||
            typeof work_performed !== "string" ||
            !work_performed.trim() ||
            typeof technician !== "string" ||
            !technician.trim()
        ) {
            return res.status(400).json({
                message: "A valid request ID, work performed, and technician are required."
            });
        }

        const data = {
            request_id: Number(request_id),
            work_performed: work_performed.trim(),
            technician: technician.trim()
        };

        const result = await Maintenance.createRecord(data);

        return res.status(201).json({
            message: "Maintenance record created successfully.",
            id: result.insertId,
            ...data
        });

    } catch (error) {
        return handleError(res, error);
    }
};


// PUT /api/maintenance/records/:id
exports.updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            work_performed,
            technician
        } = req.body;

        if (
            !isValidId(id) ||
            typeof work_performed !== "string" ||
            !work_performed.trim() ||
            typeof technician !== "string" ||
            !technician.trim()
        ) {
            return res.status(400).json({
                message: "A valid record ID, work performed, and technician are required."
            });
        }

        const result = await Maintenance.updateRecord(id, {
            work_performed: work_performed.trim(),
            technician: technician.trim()
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance record not found."
            });
        }

        return res.status(200).json({
            message: "Maintenance record updated successfully."
        });

    } catch (error) {
        return handleError(res, error);
    }
};


// DELETE /api/maintenance/records/:id
exports.deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid maintenance record ID."
            });
        }

        const result = await Maintenance.deleteRecord(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance record not found."
            });
        }

        return res.status(200).json({
            message: "Maintenance record deleted successfully."
        });

    } catch (error) {
        return handleError(res, error);
    }
};

// MAINTENANCE STATUSES
// GET /api/maintenance/statuses
exports.getStatuses = async (req, res) => {
    try {
        const statuses = await Maintenance.getAllStatuses();

        return res.status(200).json(statuses);

    } catch (error) {
        return handleError(res, error);
    }
};


// POST /api/maintenance/statuses
exports.createStatus = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                message: "A status name is required."
            });
        }

        const data = {
            name: name.trim(),
            description:
                typeof description === "string"
                    ? description.trim()
                    : null
        };

        const result = await Maintenance.createStatus(data);

        return res.status(201).json({
            message: "Maintenance status created successfully.",
            id: result.insertId,
            ...data
        });

    } catch (error) {
        return handleError(res, error);
    }
};


// PUT /api/maintenance/statuses/:id
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (
            !isValidId(id) ||
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                message: "A valid status ID and status name are required."
            });
        }

        const result = await Maintenance.updateStatus(id, {
            name: name.trim(),
            description:
                typeof description === "string"
                    ? description.trim()
                    : null
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance status not found."
            });
        }

        return res.status(200).json({
            message: "Maintenance status updated successfully."
        });

    } catch (error) {
        return handleError(res, error);
    }
};


// DELETE /api/maintenance/statuses/:id
exports.deleteStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                message: "Invalid maintenance status ID."
            });
        }

        const result = await Maintenance.deleteStatus(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Maintenance status not found."
            });
        }

        return res.status(200).json({
            message: "Maintenance status deleted successfully."
        });

    } catch (error) {
        return handleError(res, error);
    }
};