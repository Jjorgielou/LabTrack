const db = require("../config/db");

// Get all users
async function getAllUsers() {
    const [rows] = await db.query(
        `SELECT
            users.user_id,
            users.first_name,
            users.last_name,
            users.email,
            roles.role_name,
            users.created_at
         FROM users
         INNER JOIN roles
            ON users.role_id = roles.role_id
         ORDER BY users.user_id DESC`
    );

    return rows;
}

// Get one user by ID
async function getUserById(userId) {
    const [rows] = await db.query(
        `SELECT
            users.user_id,
            users.first_name,
            users.last_name,
            users.email,
            roles.role_name,
            users.created_at
         FROM users
         INNER JOIN roles
            ON users.role_id = roles.role_id
         WHERE users.user_id = ?`,
        [userId]
    );

    return rows[0];
}

// Update user information
async function updateUser(userId, firstName, lastName, email) {
    const [result] = await db.query(
        `UPDATE users
         SET first_name = ?, last_name = ?, email = ?
         WHERE user_id = ?`,
        [firstName, lastName, email, userId]
    );

    return result;
}

// Change user's role
async function updateUserRole(userId, roleId) {
    const [result] = await db.query(
        `UPDATE users
         SET role_id = ?
         WHERE user_id = ?`,
        [roleId, userId]
    );

    return result;
}

// Delete user
async function deleteUser(userId) {
    const [result] = await db.query(
        "DELETE FROM users WHERE user_id = ?",
        [userId]
    );

    return result;
}

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserRole,
    deleteUser
};
