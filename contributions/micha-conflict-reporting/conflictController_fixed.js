
const conflictModel = require("./ConflictModels_fixed");

const isValidId = (id) =>
    Number.isInteger(Number(id)) && Number(id) > 0;

const sendServerError = (res, error) => {
    console.error("Conflict module error:", error);

    if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            success: false,
            message: "This record already exists."
        });
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
            success: false,
            message: "A referenced record does not exist."
        });
    }

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({
            success: false,
            message: "This record is being used by another record."
        });
    }

    return res.status(500).json({
        success: false,
        message: "An internal server error occurred."
    });
};

const sendSuccess = (res, data, status = 200) =>
    res.status(status).json({
        success: true,
        data
    });

const getSessionUserId = (req) => req.session?.user?.user_id;

// Departments
exports.getDepartments = async (req, res) => {
    try {
        const departments = await conflictModel.getAllDepartments();
        return sendSuccess(res, departments);
    } catch (error) {
        return sendServerError(res, error);
    }
};

exports.addDepartment = async (req, res) => {
    try {
        const department_name = req.body.department_name?.trim();

        if (!department_name) {
            return res.status(400).json({
                success: false,
                message: "Department name is required."
            });
        }

        const result = await conflictModel.createDepartment(department_name);

        return sendSuccess(res, {
            department_id: result.insertId,
            department_name
        }, 201);
    } catch (error) {
        return sendServerError(res, error);
    }
};

exports.editDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const department_name = req.body.department_name?.trim();

        if (!isValidId(id) || !department_name) {
            return res.status(400).json({
                success: false,
                message: "A valid department ID and department name are required."
            });
        }

        const result = await conflictModel.updateDepartment(id, department_name);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found."
            });
        }

        return sendSuccess(res, {
            department_id: Number(id),
            department_name
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

exports.removeDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID."
            });
        }

        const result = await conflictModel.deleteDepartment(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found."
            });
        }

        return sendSuccess(res, {
            message: "Department deleted successfully."
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

// Courses
exports.getCourses = async (req, res) => {
    try {
        const courses = await conflictModel.getAllCourses();
        return sendSuccess(res, courses);
    } catch (error) {
        return sendServerError(res, error);
    }
};

exports.addCourse = async (req, res) => {
    try {
        const { course_name, course_code, department_id } = req.body;

        if (
            typeof course_name !== "string" ||
            !course_name.trim() ||
            typeof course_code !== "string" ||
            !course_code.trim() ||
            !isValidId(department_id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid course name, course code, and department ID are required."
            });
        }

        const data = {
            course_name: course_name.trim(),
            course_code: course_code.trim(),
            department_id: Number(department_id)
        };

        const result = await conflictModel.createCourse(data);

        return sendSuccess(res, {
            course_id: result.insertId,
            ...data
        }, 201);
    } catch (error) {
        return sendServerError(res, error);
    }
};

exports.editCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { course_name, course_code, department_id } = req.body;

        if (
            !isValidId(id) ||
            typeof course_name !== "string" ||
            !course_name.trim() ||
            typeof course_code !== "string" ||
            !course_code.trim() ||
            !isValidId(department_id)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid course ID, name, code, and department ID are required."
            });
        }

        const data = {
            course_name: course_name.trim(),
            course_code: course_code.trim(),
            department_id: Number(department_id)
        };

        const result = await conflictModel.updateCourse(id, data);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found or no changes were made."
            });
        }

        return sendSuccess(res, {
            course_id: Number(id),
            ...data
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

exports.removeCourse = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID."
            });
        }

        const result = await conflictModel.deleteCourse(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found."
            });
        }

        return sendSuccess(res, {
            message: "Course deleted successfully."
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

// Conflict logs
exports.getConflicts = async (req, res) => {
    try {
        const conflicts = await conflictModel.getAllConflicts();
        return sendSuccess(res, conflicts);
    } catch (error) {
        return sendServerError(res, error);
    }
};

exports.addConflict = async (req, res) => {
    try {
        const {
            booking_id,
            conflict_booking_id,
            lab_id,
            conflict_type,
            description
        } = req.body;

        if (
            !isValidId(booking_id) ||
            !isValidId(conflict_booking_id) ||
            !isValidId(lab_id) ||
            booking_id === conflict_booking_id ||
            Number(booking_id) === Number(conflict_booking_id) ||
            typeof conflict_type !== "string" ||
            !conflict_type.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid booking IDs, laboratory ID, and conflict type are required. The two bookings must be different."
            });
        }

        const data = {
            booking_id: Number(booking_id),
            conflict_booking_id: Number(conflict_booking_id),
            lab_id: Number(lab_id),
            conflict_type: conflict_type.trim(),
            description: typeof description === "string" ? description.trim() : null
        };

        const result = await conflictModel.createConflict(data);

        return sendSuccess(res, {
            conflict_id: result.insertId,
            ...data
        }, 201);
    } catch (error) {
        return sendServerError(res, error);
    }
};

exports.editConflictStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { conflict_status } = req.body;

        const allowedStatuses = [
            "detected",
            "reviewed",
            "resolved",
            "dismissed"
        ];

        if (
            !isValidId(id) ||
            !allowedStatuses.includes(conflict_status)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid conflict ID and conflict status are required."
            });
        }

        const result = await conflictModel.updateConflictStatus(
            id,
            conflict_status
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Conflict not found."
            });
        }

        return sendSuccess(res, {
            conflict_id: Number(id),
            conflict_status
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

exports.removeConflict = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conflict ID."
            });
        }

        const result = await conflictModel.deleteConflict(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Conflict not found."
            });
        }

        return sendSuccess(res, {
            message: "Conflict deleted successfully."
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};

// Notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await conflictModel.getAllNotifications();
        return sendSuccess(res, notifications);
    } catch (error) {
        return sendServerError(res, error);
    }
};

exports.getUserNotifications = async (req, res) => {
    try {
        const userId = getSessionUserId(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const notifications = await conflictModel.getUserNotifications(userId);

        return sendSuccess(res, notifications);
    } catch (error) {
        return sendServerError(res, error);
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

        if (
            !isValidId(user_id) ||
            typeof message !== "string" ||
            !message.trim() ||
            typeof notification_type !== "string" ||
            !notification_type.trim() ||
            (
                booking_id !== undefined &&
                booking_id !== null &&
                !isValidId(booking_id)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid user ID, message, notification type, and optional booking ID are required."
            });
        }

        const data = {
            user_id: Number(user_id),
            message: message.trim(),
            notification_type: notification_type.trim(),
            booking_id: booking_id == null ? null : Number(booking_id)
        };

        const result = await conflictModel.createNotification(data);

        return sendSuccess(res, {
            notification_id: result.insertId,
            ...data
        }, 201);
    } catch (error) {
        return sendServerError(res, error);
    }
};

exports.removeNotification = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID."
            });
        }

        const result = await conflictModel.deleteNotification(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Notification not found."
            });
        }

        return sendSuccess(res, {
            message: "Notification deleted successfully."
        });
    } catch (error) {
        return sendServerError(res, error);
    }
};
