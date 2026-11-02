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

router.get("/conflicts", controller.getConflicts);
router.post("/conflicts", controller.addConflict);
router.put("/conflicts/:id/status", controller.editConflictStatus);
router.delete("/conflicts/:id", controller.removeConflict);


// Notifications

router.get("/notifications", controller.getNotifications);
router.get("/notifications/user/:userId", controller.getUserNotifications);
router.post("/notifications", controller.addNotification);
router.delete("/notifications/:id", controller.removeNotification);

module.exports = router;