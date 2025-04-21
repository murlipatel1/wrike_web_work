const express = require('express');
const tokenController = require('../controllers/tokenController');

const router = express.Router();

// Token routes
router.get('/wrike', tokenController.getWrikeToken);
router.get('/webwork', tokenController.getWebworkToken);
router.get('/webwork/expiry', tokenController.getWebworkTokenExpiry);
router.put('/wrike', tokenController.updateWrikeToken);
router.put('/webwork', tokenController.updateWebworkToken);

module.exports = router;