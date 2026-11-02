
const departmentModel = require('../models/departmentModel');

exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await departmentModel.getAllDepartments();
        res.status(200).json({ success: true, data: departments });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve departments.'
        });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const department_name = req.body.department_name?.trim();

        if (!department_name) {
            return res.status(400).json({
                success: false,
                message: 'Department name is required.'
            });
        }

        const department = await departmentModel.createDepartment(department_name);

        res.status(201).json({
            success: true,
            message: 'Department created successfully.',
            data: department
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'This department already exists.'
            });
        }

        console.error('Create department error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create department.'
        });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const deleted = await departmentModel.deleteDepartment(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Department not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department deleted successfully.'
        });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete a department that has courses assigned to it.'
            });
        }

        console.error('Delete department error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete department.'
        });
    }
};
