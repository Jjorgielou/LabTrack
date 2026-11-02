
const courseModel = require('../models/courseModel');
const pool = require('../config/db');

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await courseModel.getAllCourses();
        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve courses.'
        });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const course_name = req.body.course_name?.trim();
        const course_code = req.body.course_code?.trim();
        const department_id = Number(req.body.department_id);

        if (
            !course_name ||
            !course_code ||
            !Number.isInteger(department_id) ||
            department_id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Course name, course code, and a valid department are required.'
            });
        }

        const [departments] = await pool.query(
            'SELECT department_id FROM departments WHERE department_id = ?',
            [department_id]
        );

        if (departments.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Selected department does not exist.'
            });
        }

        const course = await courseModel.createCourse({
            course_name,
            course_code,
            department_id
        });

        res.status(201).json({
            success: true,
            message: 'Course created successfully.',
            data: course
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'This course code already exists.'
            });
        }

        console.error('Create course error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create course.'
        });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const deleted = await courseModel.deleteCourse(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Course not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully.'
        });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete course.'
        });
    }
};

