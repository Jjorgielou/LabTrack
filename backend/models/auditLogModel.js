const db = require("../config/db");

// Create an audit log
async function createAuditLog(userId, action, details = null) {
    const [result] = await db.query(
        `INSERT INTO audit_logs (user_id, action, details)
         VALUES (?, ?, ?)`,
        [userId, action, details]
    );

    return result;
}

// Get all audit logs
async function getAllAuditLogs() {
    const [rows] = await db.query(
        `SELECT
            audit_logs.log_id,
            audit_logs.user_id,
            users.first_name,
            users.last_name,
            audit_logs.action,
            audit_logs.details,
            audit_logs.created_at
         FROM audit_logs
         LEFT JOIN users
            ON audit_logs.user_id = users.user_id
         ORDER BY audit_logs.created_at DESC`
    );

    return rows;
}

// Safely record an audit log without interrupting the main operation
async function safeCreateAuditLog(userId, action, details = null) {
    try {
        await createAuditLog(userId, action, details);
    } catch (error) {
        console.error("Audit logging failed:", error.message);
    }
}

module.exports = {
    createAuditLog,
    getAllAuditLogs,
    safeCreateAuditLog
};