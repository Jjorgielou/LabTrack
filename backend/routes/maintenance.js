const express = require('express');
const router = express.Router();
const controller = require('../controllers/maintenanceController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.updateStatus);
router.delete('/:id', controller.remove);

module.exports = router;