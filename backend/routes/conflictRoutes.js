const express = require('express');
const router = express.Router();
const controller = require('. . /controllers/conflictController');
const { verifyToken } = require('. . /middleware/authmiddleware');

routes.post('/report', verifyToken, controller.reportConflict);
router.get('/all', verifyToken, controller.getConflicts);

module.exports = router