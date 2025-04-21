const express = require('express');
const wrikeRoutes = require('./wrikeRoutes');
const taskRoutes = require('./taskRoutes');
const userRoutes = require('./userRoutes');
const tokenRoutes = require('./tokenRoutes');
const apiLogRoutes = require('./apiLogRoutes');
const settingRoutes = require('./settingRoutes');
const authRoutes = require('./authRoutes');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.use('/wrike', wrikeRoutes); // No auth for webhook
router.use('/auth', authRoutes);

// Protected routes
router.use('/tasks', auth, taskRoutes);
router.use('/users', auth, userRoutes);
router.use('/tokens', auth, tokenRoutes);
router.use('/api-logs', auth, apiLogRoutes);
router.use('/settings', auth, settingRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).send('Service is healthy');
});

module.exports = router;