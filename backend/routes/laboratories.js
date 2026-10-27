const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/laboratoryController');

router.get('/', ctrl. getAllLabs);
router.get('/:id', ctrl.getLabById);
router.post('/', ctrl.createLab);
router.put('/:id', ctrl.updateLab);
router.delete('/:id', ctrl.deleteLab);

module.exports = router;