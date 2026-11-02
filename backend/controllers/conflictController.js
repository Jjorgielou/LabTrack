const LabTrack = require("../models/labTrackModel");

// Departments

exports.getDepartments = async (req, res) => {
    try {
        const data = await LabTrack.getAllDepartments();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addDepartment = async (req, res) => {
    try {
        const { department_name } = req.body;

        if (!department_name) {
            return res.status(400).json({
                message: "Department name is required"
            });
        }

        const result = await LabTrack.createDepartment(department_name);

        res.status(201).json({
            message: "Department added successfully",
            department_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.editDepartment = async (req, res) => {
    try {
        const { department_name } = req.body;

        if (!department_name) {
            return res.status(400).json({
                message: "Department name is required"
            });
        }

        const result = await LabTrack.updateDepartment(
            req.params.id,
            department_name
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.json({ message: "Department updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeDepartment = async (req, res) => {
    try {
        const result = await LabTrack.deleteDepartment(req.params.id);

        if (!result.affectedRows) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        res.json({ message: "Department deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Courses

exports.getCourses = async (req, res) => {
    try {
        const data = await LabTrack.getAllCourses();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addCourse = async (req, res) => {
    try {
        const { course_name, course_code, department_id } = req.body;

        if (!course_name || !course_code || !department_id) {
            return res.status(400).json({
                message: "All course fields are required"
            });
        }

        const result = await LabTrack.createCourse(req.body);

        res.status(201).json({
            message: "Course added successfully",
            course_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.editCourse = async (req, res) => {
    try {
        const { course_name, course_code, department_id } = req.body;

        if (!course_name || !course_code || !department_id) {
            return res.status(400).json({
                message: "All course fields are required"
            });
        }

        const result = await LabTrack.updateCourse(
            req.params.id,
            req.body
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        res.json({ message: "Course updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeCourse = async (req, res) => {
    try {
        const result = await LabTrack.deleteCourse(req.params.id);

        if (!result.affectedRows) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Conflict_logs

exports.getConflicts = async (req, res) => {
    try {
        const data = await LabTrack.getAllConflicts();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addConflict = async (req, res) => {
    try {
        const {
            booking_id,
            conflict_booking_id,
            laboratory_id,
            conflict_type
        } = req.body;

        if (
            !booking_id ||
            !conflict_booking_id ||
            !laboratory_id ||
            !conflict_type
        ) {
            return res.status(400).json({
                message: "Required conflict fields are missing"
            });
        }

        const result = await LabTrack.createConflict(req.body);

        res.status(201).json({
            message: "Conflict logged successfully",
            conflict_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.editConflictStatus = async (req, res) => {
    try {
        const { conflict_status } = req.body;

        const validStatuses = [
            "detected",
            "reviewed",
            "resolved",
            "dismissed"
        ];

        if (!validStatuses.includes(conflict_status)) {
            return res.status(400).json({
                message: "Invalid conflict status"
            });
        }

        const result = await LabTrack.updateConflictStatus(
            req.params.id,
            conflict_status
        );

        if (!result.affectedRows) {
            return res.status(404).json({
                message: "Conflict not found"
            });
        }

        res.json({
            message: "Conflict status updated successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeConflict = async (req, res) => {
    try {
        const result = await LabTrack.deleteConflict(req.params.id);

        if (!result.affectedRows) {
            return res.status(404).json({
                message: "Conflict not found"
            });
        }

        res.json({ message: "Conflict deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Notifications

exports.getNotifications = async (req, res) => {
    try {
        const data = await LabTrack.getAllNotifications();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserNotifications = async (req, res) => {
    try {
        const data = await LabTrack.getUserNotifications(
            req.params.userId
        );

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addNotification = async (req, res) => {
    try {
        const {
            user_id,
            message,
            notification_type,
            booking_id
        } = req.body;

        if (!user_id || !message || !notification_type || !booking_id) {
            return res.status(400).json({
                message: "All notification fields are required"
            });
        }

        const result = await LabTrack.createNotification(req.body);

        res.status(201).json({
            message: "Notification created successfully",
            notification_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeNotification = async (req, res) => {
    try {
        const result = await LabTrack.deleteNotification(req.params.id);

        if (!result.affectedRows) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};