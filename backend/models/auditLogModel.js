const db = require('../config/db');

const AuditLog = {
  getAllLogs: async () => {
    const query = `
      SELECT 
        al.*,
        u.name AS user_name,
        u.email AS user_email,
        r.name AS role_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY al.created_at DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  }
};

module.exports = AuditLog;