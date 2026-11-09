const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/laboratoryController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

router.use(requireAuth);

router.get('/', requireRole('Admin', 'Laboratory Staff', 'Student'), ctrl.getAllLabs);
router.get('/unavailable', requireRole('Admin', 'Laboratory Staff', 'Student'), ctrl.getUnavailableLabs);
router.get('/:id', requireRole('Admin', 'Laboratory Staff', 'Student'), ctrl.getLabById);

router.post('/', requireRole('Admin', 'Laboratory Staff'), ctrl.createLab);
router.put('/:id', requireRole('Admin', 'Laboratory Staff'), ctrl.updateLab);

router.delete('/:id', requireRole('Admin'), ctrl.deleteLab);

module.exports = router;