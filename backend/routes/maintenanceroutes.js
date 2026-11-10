const express = require("express");
const router = express.Router();

const maintenanceController = require("../controllers/maintenanceController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

// MAINTENANCE REQUESTS
// All logged-in users can view and submit requests
router.get(
    "/requests",
    requireAuth,
    maintenanceController.getRequests
);

router.post(
    "/requests",
    requireAuth,
    maintenanceController.createRequest
);

// Only Admin and Laboratory Staff can modify requests
router.put(
    "/requests/:id",
    requireAuth,
    requireRole("Admin", "Laboratory Staff"),
    maintenanceController.updateRequest
);

router.delete(
    "/requests/:id",
    requireAuth,
    requireRole("Admin", "Laboratory Staff"),
    maintenanceController.deleteRequest
);
// MAINTENANCE RECORDS
// All logged-in users can view records
router.get(
    "/records",
    requireAuth,
    maintenanceController.getRecords
);

// Only Admin and Laboratory Staff can manage records
router.post(
    "/records",
    requireAuth,
    requireRole("Admin", "Laboratory Staff"),
    maintenanceController.createRecord
);

router.put(
    "/records/:id",
    requireAuth,
    requireRole("Admin", "Laboratory Staff"),
    maintenanceController.updateRecord
);

router.delete(
    "/records/:id",
    requireAuth,
    requireRole("Admin", "Laboratory Staff"),
    maintenanceController.deleteRecord
);

// MAINTENANCE STATUSES
// All logged-in users can view statuses
router.get(
    "/statuses",
    requireAuth,
    maintenanceController.getStatuses
);

// Only Admin and Laboratory Staff can manage statuses
router.post(
    "/statuses",
    requireAuth,
    requireRole("Admin", "Laboratory Staff"),
    maintenanceController.createStatus
);

router.put(
    "/statuses/:id",
    requireAuth,
    requireRole("Admin", "Laboratory Staff"),
    maintenanceController.updateStatus
);

router.delete(
    "/statuses/:id",
    requireAuth,
    requireRole("Admin", "Laboratory Staff"),
    maintenanceController.deleteStatus
);

module.exports = router;
