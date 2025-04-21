const express = require('express');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Auth routes
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.post('/add-admin', auth,  authController.createAdmin);
router.post('/change-password', auth, authController.changePassword);

module.exports = router;