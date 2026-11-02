const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/laboratoryController');

const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

//Public Routes (all authenticated roles can read)
router.get('/', requireAuth, ctrl.getAllLabs);
router.get('/unavailable', requireAuth, ctrl.getUnavailableLabs);
router.get('/:id', requireAuth, ctrl.getLabById);

//Protected Routes (Admin + Laboratory Staff only)
router.post('/', requireAuth, requireRole('Admin', 'Laboratory Staff'), ctrl.createLab);
router.put('/:id', requireAuth, requireRole('Admin', 'Laboratory Staff'), ctrl.updateLab);

//Admin Only Routes
router.delete('/:id', requireAuth, requireRole('Admin'), ctrl.deleteLab);

module.exports = router;