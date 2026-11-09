const userModel = require("../models/userModel");
const auditLogModel = require("../models/auditLogModel");
const db = require("../config/db");

// GET /api/users
async function getAllUsers(req, res) {
    try {
        const users = await userModel.getAllUsers();

        return res.status(200).json({
            message: "Users retrieved successfully.",
            count: users.length,
            users
        });
    } catch (error) {
        console.error("Get users error:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve users."
        });
    }
}

// GET /api/users/:id
async function getUserById(req, res) {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        const user = await userModel.getUserById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        return res.status(200).json({
            message: "User retrieved successfully.",
            user
        });
    } catch (error) {
        console.error("Get user error:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve user."
        });
    }
}

// PUT /api/users/:id
async function updateUser(req, res) {
    try {
        const userId = Number(req.params.id);
        const { first_name, last_name, email } = req.body;

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        if (!first_name || !last_name || !email) {
            return res.status(400).json({
                message: "First name, last name, and email are required."
            });
        }

        const existingUser = await userModel.getUserById(userId);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        await userModel.updateUser(
            userId,
            first_name.trim(),
            last_name.trim(),
            email.trim()
        );

        await auditLogModel.safeCreateAuditLog(
            req.session.user.user_id,
            "USER_UPDATED",
            `Updated information for user ID ${userId}.`
        );

        return res.status(200).json({
            message: "User updated successfully."
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "Email is already in use."
            });
        }

        console.error("Update user error:", error.message);

        return res.status(500).json({
            message: "Failed to update user."
        });
    }
}

// PATCH /api/users/:id/role
async function updateUserRole(req, res) {
    try {
        const userId = Number(req.params.id);
        const { role_id } = req.body;

        if (!Number.isInteger(userId) || userId <= 0 ||
            !Number.isInteger(role_id) || role_id <= 0) {
            return res.status(400).json({
                message: "Valid user ID and role ID are required."
            });
        }

        const existingUser = await userModel.getUserById(userId);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found."
            });
        }

      // Prevent demoting the last Admin
        const [adminRows] = await db.query(
            `SELECT COUNT(*) AS total
             FROM users
             INNER JOIN roles ON users.role_id = roles.role_id
             WHERE roles.role_name = 'Admin'`
        );

        if (existingUser.role_name === "Admin" &&
            role_id !== 1 &&
            adminRows[0].total <= 1) {
            return res.status(400).json({
                message: "You cannot demote the last Admin account."
            });
        }

        const result = await userModel.updateUserRole(userId, role_id);

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: "Role was not updated."
            });
        }

        await auditLogModel.safeCreateAuditLog(
            req.session.user.user_id,
            "USER_ROLE_CHANGED",
            `Changed the role of user ID ${userId} to role ID ${role_id}.`
        );

        return res.status(200).json({
            message: "User role updated successfully."
        });
    } catch (error) {
        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                message: "The specified role does not exist."
            });
        }

        console.error("Update role error:", error.message);

        return res.status(500).json({
            message: "Failed to update user role."
        });
    }
}

// DELETE /api/users/:id
async function deleteUser(req, res) {
    try {
        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        if (userId === req.session.user.user_id) {
            return res.status(400).json({
                message: "You cannot delete your own account."
            });
        }

        const existingUser = await userModel.getUserById(userId);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        // Prevent deleting the last Admin
        if (existingUser.role_name === "Admin") {
            const db = require("../config/db");

        const [adminCount] = await db.query(
            `SELECT COUNT(*) AS total
             FROM users
             INNER JOIN roles
                ON users.role_id = roles.role_id
             WHERE roles.role_name = 'Admin'`
        );

         if (adminCount[0].total <= 1) {
            return res.status(400).json({
                message: "You cannot delete the last Admin account."
            });
        }
    }

        await userModel.deleteUser(userId);
        
        await auditLogModel.safeCreateAuditLog(
            req.session.user.user_id,
            "USER_DELETED",
            `Deleted user ID ${userId} (${existingUser.email}).`
        );

        return res.status(200).json({
            message: "User deleted successfully."
        });
    } catch (error) {
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(400).json({
                message: "Cannot delete this user because related records exist."
            });
        }

        console.error("Delete user error:", error.message);

        return res.status(500).json({
            message: "Failed to delete user."
        });
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserRole,
    deleteUser
};
