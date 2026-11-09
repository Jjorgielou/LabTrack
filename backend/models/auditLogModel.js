
const db = require("../config/db");

// ==========================================
// GET ALL AUDIT LOGS
// ==========================================

async function getAllAuditLogs() {
    const [rows] = await db.query(
        `SELECT
            al.*,
            CONCAT(u.first_name, ' ', u.last_name) AS user_name,
            u.email AS user_email,
            r.role_name
         FROM audit_logs al
         LEFT JOIN users u
            ON al.user_id = u.user_id
         LEFT JOIN roles r
            ON u.role_id = r.role_id
         ORDER BY al.created_at DESC`
    );

    return rows;
}

// ==========================================
// CREATE AUDIT LOG
// ==========================================

async function safeCreateAuditLog(userId, action, details) {
    const [result] = await db.query(
        `INSERT INTO audit_logs
            (user_id, action, details)
         VALUES (?, ?, ?)`,
        [userId || null, action, details || null]
    );

    return result;
}

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
    getAllAuditLogs,
    safeCreateAuditLog,

    // Keep the old function name for compatibility
    getAllLogs: getAllAuditLogs
};
