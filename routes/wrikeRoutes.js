const express = require('express');
const wrikewebworkController = require('../controllers/wrikeWebworkController');

const router = express.Router();

// Wrike webhook endpoint
router.post('/webhook', wrikewebworkController.handleWebhook);

module.exports = router;