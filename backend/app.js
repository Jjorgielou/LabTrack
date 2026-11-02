
const express = require("express");
require("dotenv").config();

const session = require("express-session");
const cors = require("cors");

const db = require("./config/db");
const userRoutes = require("./routes/users");
const labRoutes = require("./routes/laboratories");
const authRoutes = require("./routes/auth");
const auditLogRoutes = require("./routes/auditLogs");

const requireAuth = require("./middleware/requireAuth");
const requireRole = require("./middleware/requireRole");

const dashboardController = require("./controllers/dashboardController");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));

app.use(express.json());

app.use(session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "labtrack-development-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60
    }
}));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/laboratories", labRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.get("/api/dashboard/stats", requireAuth, requireRole("Admin"), dashboardController.getDashboardStats);

// Welcome Route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to LabTrack!",
        status: "running"
    });
});

// Database Health Check
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

// Admin Test Route
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

// Laboratory Staff Test Route
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

// Start Server
app.listen(PORT, () => {
    console.log(`LabTrack server is running at http://localhost:${PORT}`);
});
