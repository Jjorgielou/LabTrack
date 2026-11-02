const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/departmentController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

router.use(requireAuth);

router.get('/', requireRole('Admin', 'Laboratory Staff', 'Student'), ctrl.getAllDepartments);

router.post('/', requireRole('Admin', 'Laboratory Staff'), ctrl.createDepartment);

router.delete('/:id', requireRole('Admin'), ctrl.deleteDepartment);

module.exports = router;