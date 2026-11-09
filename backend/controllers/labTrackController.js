const LabTrack = require("../models/labTrackModel");

// Departments
exports.getDepartments = async (req, res) => {
  try {
    const data = await LabTrack.getAllDepartments();
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addDepartment = async (req, res) => {
  try {
    const result = await LabTrack.createDepartment(req.body.department_name);
    res.status(201).json({ message: "Department added", id: result.insertId });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.editDepartment = async (req, res) => {
  try {
    await LabTrack.updateDepartment(req.params.id, req.body.department_name);
    res.json({ message: "Department updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.removeDepartment = async (req, res) => {
  try {
    await LabTrack.deleteDepartment(req.params.id);
    res.json({ message: "Department deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Courses
exports.getCourses = async (req, res) => {
  try {
    const data = await LabTrack.getAllCourses();
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addCourse = async (req, res) => {
  try {
    const result = await LabTrack.createCourse(req.body);
    res.status(201).json({ message: "Course added", id: result.insertId });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.editCourse = async (req, res) => {
  try {
    await LabTrack.updateCourse(req.params.id, req.body);
    res.json({ message: "Course updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.removeCourse = async (req, res) => {
  try {
    await LabTrack.deleteCourse(req.params.id);
    res.json({ message: "Course deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Conflicts
exports.getConflicts = async (req, res) => {
  try {
    const data = await LabTrack.getAllConflicts();
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addConflict = async (req, res) => {
  try {
    const result = await LabTrack.createConflict(req.body);
    res.status(201).json({ message: "Conflict logged", id: result.insertId });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.editConflictStatus = async (req, res) => {
  try {
    await LabTrack.updateConflictStatus(req.params.id, req.body.conflict_status);
    res.json({ message: "Conflict status updated" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.removeConflict = async (req, res) => {
  try {
    await LabTrack.deleteConflict(req.params.id);
    res.json({ message: "Conflict deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Notifications
exports.getNotifications = async (req, res) => {
  try {
    const data = await LabTrack.getAllNotifications();
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const data = await LabTrack.getUserNotifications(req.params.userId);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addNotification = async (req, res) => {
  try {
    const result = await LabTrack.createNotification(req.body);
    res.status(201).json({ message: "Notification created", id: result.insertId });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.removeNotification = async (req, res) => {
  try {
    await LabTrack.deleteNotification(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};