const express = require('express');
const settingController = require('../controllers/settingController');

const router = express.Router();

// Setting routes
router.get('/batch-size', settingController.getBatchSize);
router.put('/batch-size', settingController.updateBatchSize);

module.exports = router;