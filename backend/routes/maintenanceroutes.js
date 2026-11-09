const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

// GET /api/maintenance/records
router.get('/records', requireAuth, requireRole(['Admin', 'Staff']), maintenanceController.getMaintenanceRecords);

// POST /api/maintenance
router.post('/', requireAuth, requireRole(['Admin', 'Staff']), maintenanceController.createRecord);

// PUT /api/maintenance/:id
router.put('/:id', requireAuth, requireRole(['Admin', 'Staff']), maintenanceController.updateStatus);

// DELETE /api/maintenance/:id
router.delete('/:id', requireAuth, requireRole(['Admin', 'Staff']), maintenanceController.deleteRecord);

module.exports = router;