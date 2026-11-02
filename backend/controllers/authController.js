const db = require("../config/db");
const bcrypt = require("bcrypt");
const auditLogModel = require("../models/auditLogModel");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const [users] = await db.query(
            `SELECT u.user_id, u.email, u.password_hash,
                    r.role_name
             FROM users u
             JOIN roles r ON u.role_id = r.role_id
             WHERE u.email = ?
             LIMIT 1`,
            [email.trim()]
        );

        console.log("Login email:", email.trim());
        console.log("Matching users found:", users.length);

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        req.session.user = {
        user_id: user.user_id,
        email: user.email,
        role: user.role_name
        };
        console.log("SESSION CREATED:", req.session.user);
        console.log("SESSION ID:", req.sessionID);


        return req.session.save(async (error) => {
            if (error) {
                console.error("Session save error:", error);

                return res.status(500).json({
                    message: "Unable to save login session."
                });
            }

            await auditLogModel.safeCreateAuditLog(
                user.user_id,
                "USER_LOGIN",
                `User ${user.email} logged in successfully.`
            );

            return res.status(200).json({
                message: "Login successful.",
                user: req.session.user
            });
        });
        await auditLogModel.safeCreateAuditLog(
            user.user_id,
            "USER_LOGIN",
            `User ${user.email} logged in successfully.`
        );

        return res.status(200).json({
            message: "Login successful.",
            user: {
                user_id: user.user_id,
                email: user.email,
                role: user.role_name
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "An internal server error occurred."
        });
    }
};

async function logout(req, res) {
    const user = req.session?.user;

    if (!user) {
        return res.status(401).json({
            message: "You are not logged in."
        });
    }

    await auditLogModel.safeCreateAuditLog(
        user.user_id,
        "USER_LOGOUT",
        `User ${user.email} logged out successfully.`
    );

    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error.message);

            return res.status(500).json({
                message: "Unable to log out."
            });
        }

        res.clearCookie("connect.sid");

        return res.status(200).json({
            message: "Logout successful."
        });
    });
}

async function register(req, res) {
    try {
        const { first_name, last_name, email, password } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        const [existingUsers] = await db.query(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                message: "Email is already registered."
            });
        }

        const [studentRoles] = await db.query(
            "SELECT role_id FROM roles WHERE role_name = ?",
            ["Student"]
        );

        if (studentRoles.length === 0) {
            return res.status(500).json({
                message: "Student role is not configured."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users
             (role_id, first_name, last_name, email, password_hash)
             VALUES (?, ?, ?, ?, ?)`,
            [
                studentRoles[0].role_id,
                first_name,
                last_name,
                email,
                passwordHash
            ]
        );

        await auditLogModel.safeCreateAuditLog(
            result.insertId,
            "USER_REGISTERED",
            `New student account registered: ${email}`
        );

        return res.status(201).json({
            message: "Registration successful.",
            user_id: result.insertId
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "An internal server error occurred."
        });
    }
}

const getMe = (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({
            message: "You are not logged in."
        });
    }

    return res.status(200).json({
        message: "Session is valid.",
        user: req.session.user
    });
};

module.exports = { login, logout, register, getMe };