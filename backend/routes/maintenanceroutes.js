
const express = require("express");
const router = express.Router();

const controller = require("../controllers/maintenanceController");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

// All Maintenance endpoints require login.
router.use(requireAuth);

// GET — Admin, Laboratory Staff, and Student.
router.get("/", controller.getAll);
router.get("/requests", controller.getRequests);
router.get("/records", controller.getRecords);
router.get("/statuses", controller.getStatuses);

// POST — Admin and Laboratory Staff.
router.post(
    "/",
    requireRole("Admin", "Laboratory Staff"),
    controller.create
);

router.post(
    "/records",
    requireRole("Admin", "Laboratory Staff"),
    controller.createRecord
);

router.post(
    "/statuses",
    requireRole("Admin", "Laboratory Staff"),
    controller.createStatus
);

// PUT — Admin and Laboratory Staff.
router.put(
    "/:id",
    requireRole("Admin", "Laboratory Staff"),
    controller.updateStatus
);

router.put(
    "/requests/:id",
    requireRole("Admin", "Laboratory Staff"),
    controller.updateRequest
);

router.put(
    "/records/:id",
    requireRole("Admin", "Laboratory Staff"),
    controller.updateRecord
);

router.put(
    "/statuses/:id",
    requireRole("Admin", "Laboratory Staff"),
    controller.updateStatusDefinition
);

// DELETE — Admin only.
router.delete(
    "/:id",
    requireRole("Admin"),
    controller.remove
);

router.delete(
    "/records/:id",
    requireRole("Admin"),
    controller.deleteRecord
);

router.delete(
    "/statuses/:id",
    requireRole("Admin"),
    controller.deleteStatus
);

module.exports = router;