const LabTrack = require('../models/labtrackModel');

// Departments
exports.getDepartments = async (req, res) => {
  try {
    const data = await LabTrack.getAllDepartments();
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.addDepartment = async (req, res) => {
  try {
    const result = await LabTrack.createDepartment(req.body);
    res.status(201).json({ message: "Department added", id: result.insertId });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
exports.editDepartment = async (req, res) => {
  try {
    await LabTrack.updateDepartment(req.params.id, req.body);
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

// Notifications
exports.getNotifications = async (req, res) => {
  try {
    const data = await LabTrack.getAllNotifications();
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
};