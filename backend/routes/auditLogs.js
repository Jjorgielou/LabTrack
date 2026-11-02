const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const {
    getAllAuditLogs
} = require("../controllers/auditLogController");

// Only Admins can view audit logs
router.use(requireAuth, requireRole("Admin"));

router.get("/", getAllAuditLogs);

module.exports = router;