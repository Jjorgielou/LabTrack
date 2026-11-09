const express = require("express");
const router = express.Router();

const maintenanceController = require("../controllers/maintenanceController");
const requireAuth = require("../middleware/requireAuth");

// MAINTENANCE REQUESTS
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

router.put(
    "/requests/:id",
    requireAuth,
    maintenanceController.updateRequest
);

router.delete(
    "/requests/:id",
    requireAuth,
    maintenanceController.deleteRequest
);

// MAINTENANCE RECORDS
router.get(
    "/records",
    requireAuth,
    maintenanceController.getRecords
);

router.post(
    "/records",
    requireAuth,
    maintenanceController.createRecord
);

router.put(
    "/records/:id",
    requireAuth,
    maintenanceController.updateRecord
);

router.delete(
    "/records/:id",
    requireAuth,
    maintenanceController.deleteRecord
);

// MAINTENANCE STATUSES
router.get(
    "/statuses",
    requireAuth,
    maintenanceController.getStatuses
);

router.post(
    "/statuses",
    requireAuth,
    maintenanceController.createStatus
);

router.put(
    "/statuses/:id",
    requireAuth,
    maintenanceController.updateStatus
);

router.delete(
    "/statuses/:id",
    requireAuth,
    maintenanceController.deleteStatus
);

module.exports = router;