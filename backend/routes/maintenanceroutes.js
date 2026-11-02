const express = require('express');
const router = express.Router();
const controller = require('../controllers/maintenanceController');

router.get('/', controller.getAll);
router.get('/requests', controller.getRequests);
router.get('/records', controller.getRecords);
router.get('/statuses', controller.getStatuses);

router.post('/', controller.create);
router.post('/records', controller.createRecord);
router.post('/statuses', controller.createStatus);

router.put('/:id', controller.updateStatus);
router.put('/requests/:id', controller.updateRequest);
router.put('/records/:id', controller.updateRecord);
router.put('/statuses/:id', controller.updateStatusDefinition);

router.delete('/:id', controller.remove);
router.delete('/records/:id', controller.deleteRecord);
router.delete('/statuses/:id', controller.deleteStatus);

module.exports = router;