const auditLogModel = require("../models/auditLogModel");

// Get all audit logs
async function getAllAuditLogs(req, res) {
    try {
        const logs = await auditLogModel.getAllAuditLogs();

        return res.status(200).json({
            message: "Audit logs retrieved successfully.",
            count: logs.length,
            logs
        });
    } catch (error) {
        console.error("Get audit logs error:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve audit logs."
        });
    }
}

module.exports = {
    getAllAuditLogs
};