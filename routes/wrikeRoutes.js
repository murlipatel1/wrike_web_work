const express = require('express');
const wrikeTimeDoctorController = require('../controllers/wrikeMonitaskController');

const router = express.Router();

// Wrike webhook endpoint
router.post('/webhook', wrikeTimeDoctorController.handleWebhook);

module.exports = router;