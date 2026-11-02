const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/courseController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

router.use(requireAuth);

router.get('/', requireRole('Admin', 'Laboratory Staff', 'Student'), ctrl.getAllCourses);

router.post('/', requireRole('Admin', 'Laboratory Staff'), ctrl.createCourse);

router.delete('/:id', requireRole('Admin'), ctrl.deleteCourse);

module.exports = router;
