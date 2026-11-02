const db = require("../config/db");

async function getDashboardStats(req, res) {
    try {
        const [userRows] = await db.query(
            "SELECT COUNT(*) AS totalUsers FROM users"
        );

        const [adminRows] = await db.query(
            `SELECT COUNT(*) AS totalAdmins
             FROM users
             JOIN roles ON users.role_id = roles.role_id
             WHERE roles.role_name = 'Admin'`
        );

        const [activityRows] = await db.query(
            `SELECT 
                audit_logs.log_id,
                audit_logs.action,
                audit_logs.details,
                audit_logs.created_at,
                users.first_name,
                users.last_name,
                users.email
             FROM audit_logs
             LEFT JOIN users ON audit_logs.user_id = users.user_id
             ORDER BY audit_logs.created_at DESC
             LIMIT 5`
        );

        res.status(200).json({
            message: "Dashboard data retrieved successfully.",
            stats: {
                totalUsers: userRows[0].totalUsers,
                totalAdmins: adminRows[0].totalAdmins
            },
            recentActivity: activityRows
        });

    } catch (error) {
        console.error("Dashboard error:", error.message);

        res.status(500).json({
            message: "Unable to retrieve dashboard data."
        });
    }
}

module.exports = { getDashboardStats };
