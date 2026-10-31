const userRoutes = require("./routes/users");
const express = require("express");
require("dotenv").config();

const session = require("express-session");
const db = require("./config/db");
const labRoutes = require("./routes/laboratories");
const authRoutes = require("./routes/auth");
const requireAuth = require("./middleware/requireAuth");
const requireRole = require("./middleware/requireRole");
const auditLogRoutes = require("./routes/auditLogs");


const app = express();
const PORT = process.env.PORT || 3000
;

// middleware
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/laboratories", labRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", auditLogRoutes);

// Welcome route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to LabTrack!",
        status: "running"
    });
});

// Database health check-up
app.get("/api/health/db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS connected");

        res.status(200).json({
            message: "Database connection success!",
            database: "connected",
            result: rows[0].connected
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);

        res.status(500).json({
            message: "Database connection failed",
            database: "disconnected"
        });
    }
});

//aunthentication of user
app.get("/api/auth/me", requireAuth, (req, res) => {
    res.status(200).json({
        message: "Authenticated user.",
        user: req.session.user
    });
});
app.get(
    "/api/admin/test",
    requireAuth,
    requireRole("Admin"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome, Admin!"
        });
    }
);

app.get(
    "/api/staff/test",
    requireAuth,
    requireRole("Laboratory Staff"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome, Laboratory Staff!"
        });
    }
);

// Start server
app.listen(PORT, () => {
    console.log(`LabTrack server is running at http://localhost:${PORT}`);
});