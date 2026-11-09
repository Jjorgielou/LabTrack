<<<<<<< Updated upstream
const express = require("express");
const router = express.Router();

const controller = require("../controllers/conflictController");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

// Departments and courses: all authenticated users can view;
// only Admin can manage.
router.get("/departments", requireAuth, controller.getDepartments);
router.post("/departments", requireAuth, requireRole("Admin"), controller.addDepartment);
router.put("/departments/:id", requireAuth, requireRole("Admin"), controller.editDepartment);
router.delete("/departments/:id", requireAuth, requireRole("Admin"), controller.removeDepartment);

router.get("/courses", requireAuth, controller.getCourses);
router.post("/courses", requireAuth, requireRole("Admin"), controller.addCourse);
router.put("/courses/:id", requireAuth, requireRole("Admin"), controller.editCourse);
router.delete("/courses/:id", requireAuth, requireRole("Admin"), controller.removeCourse);

// Conflicts: Admin and Laboratory Staff can manage;
// only Admin can delete.
router.get("/conflicts", requireAuth, requireRole("Admin", "Laboratory Staff"), controller.getConflicts);
router.post("/conflicts", requireAuth, requireRole("Admin", "Laboratory Staff"), controller.addConflict);
router.put("/conflicts/:id/status", requireAuth, requireRole("Admin", "Laboratory Staff"), controller.editConflictStatus);
router.delete("/conflicts/:id", requireAuth, requireRole("Admin"), controller.removeConflict);

// Notifications: users can view their own;
// Admin and Laboratory Staff can view all and create.
router.get("/notifications", requireAuth, requireRole("Admin", "Laboratory Staff"), controller.getNotifications);
router.get("/notifications/mine", requireAuth, controller.getUserNotifications);
router.post("/notifications", requireAuth, requireRole("Admin", "Laboratory Staff"), controller.addNotification);
router.delete("/notifications/:id", requireAuth, requireRole("Admin"), controller.removeNotification);

=======
const express = require("express");
const router = express.Router();

const controller = require("../controllers/labTrackController");

// Departments

router.get("/departments", controller.getDepartments);
router.post("/departments", controller.addDepartment);
router.put("/departments/:id", controller.editDepartment);
router.delete("/departments/:id", controller.removeDepartment);


// Course

router.get("/courses", controller.getCourses);
router.post("/courses", controller.addCourse);
router.put("/courses/:id", controller.editCourse);
router.delete("/courses/:id", controller.removeCourse);


// Conflict_logs

router.get("/", controller.getConflicts);
router.post("/", controller.addConflict);
router.put("/:id/status", controller.editConflictStatus);
router.delete("/:id", controller.removeConflict);


// Notifications

router.get("/notifications", controller.getNotifications);
router.get("/notifications/user/:userId", controller.getUserNotifications);
router.post("/notifications", controller.addNotification);
router.delete("/notifications/:id", controller.removeNotification);

>>>>>>> Stashed changes
module.exports = router;