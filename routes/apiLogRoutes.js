const express = require('express');
const apiLogController = require('../controllers/apiLogController');

const router = express.Router();

// API Log route - get all logs
router.get('/all', apiLogController.getApiLogs);

module.exports = router;