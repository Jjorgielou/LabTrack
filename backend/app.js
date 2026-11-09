const express = require("express");
require("dotenv").config();

const session = require("express-session");
const cors = require("cors");

const db = require("./config/db");

// Route imports
const path = require("path");
const userRoutes = require("./routes/users");
const labRoutes = require("./routes/laboratories");
const authRoutes = require("./routes/auth");
const auditLogRoutes = require("./routes/auditLogs");

const conflictRoutes = require("./routes/conflictRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");

const equipmentRoutes = require("./routes/equipment");
const equipmentCategoryRoutes = require("./routes/equipmentCategories");
const maintenanceRoutes = require("./routes/maintenanceroutes");
const departmentRoutes = require("./routes/departmentRoutes");
const courseRoutes = require("./routes/courseRoutes");

// Middleware imports
const requireAuth = require("./middleware/requireAuth");
const requireRole = require("./middleware/requireRole");

// Controller imports
const dashboardController = require("./controllers/dashboardController");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend"), {
    index: false
}));

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

app.get(
    "/api/dashboard/stats",
    requireAuth,
    requireRole("Admin"),
    dashboardController.getDashboardStats
);

app.use("/api/conflicts", conflictRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/schedules", scheduleRoutes);

app.use("/api/equipment", equipmentRoutes);
app.use("/api/equipment-categories", equipmentCategoryRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/courses", courseRoutes);

// Open login page by default
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
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