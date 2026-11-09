const express = require("express");
const router = express.Router();

const controller = require("../controllers/conflictController");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

// Departments
router.get("/departments", requireAuth, controller.getDepartments);
router.post(
    "/departments",
    requireAuth,
    requireRole(["Admin"]),
    controller.addDepartment
);
router.put(
    "/departments/:id",
    requireAuth,
    requireRole(["Admin"]),
    controller.editDepartment
);
router.delete(
    "/departments/:id",
    requireAuth,
    requireRole(["Admin"]),
    controller.removeDepartment
);

// Courses
router.get("/courses", requireAuth, controller.getCourses);
router.post(
    "/courses",
    requireAuth,
    requireRole(["Admin"]),
    controller.addCourse
);
router.put(
    "/courses/:id",
    requireAuth,
    requireRole(["Admin"]),
    controller.editCourse
);
router.delete(
    "/courses/:id",
    requireAuth,
    requireRole(["Admin"]),
    controller.removeCourse
);

// Conflict logs
router.get(
    "/conflicts",
    requireAuth,
    requireRole(["Admin", "Laboratory Staff"]),
    controller.getConflicts
);
router.post(
    "/conflicts",
    requireAuth,
    requireRole(["Admin", "Laboratory Staff"]),
    controller.addConflict
);
router.put(
    "/conflicts/:id/status",
    requireAuth,
    requireRole(["Admin", "Laboratory Staff"]),
    controller.editConflictStatus
);
router.delete(
    "/conflicts/:id",
    requireAuth,
    requireRole(["Admin"]),
    controller.removeConflict
);

// Notifications
router.get(
    "/notifications",
    requireAuth,
    requireRole(["Admin", "Laboratory Staff"]),
    controller.getNotifications
);
router.get(
    "/notifications/mine",
    requireAuth,
    controller.getUserNotifications
);
router.post(
    "/notifications",
    requireAuth,
    requireRole(["Admin", "Laboratory Staff"]),
    controller.addNotification
);
router.delete(
    "/notifications/:id",
    requireAuth,
    requireRole(["Admin"]),
    controller.removeNotification
);

module.exports = router;