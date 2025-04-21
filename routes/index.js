const express = require('express');
const wrikeRoutes = require('./wrikeRoutes');
const taskRoutes = require('./taskRoutes');
const userRoutes = require('./userRoutes');
const tokenRoutes = require('./tokenRoutes');
const apiLogRoutes = require('./apiLogRoutes');

const router = express.Router();

// Mount route groups
router.use('/wrike', wrikeRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);
router.use('/tokens', tokenRoutes);
router.use('/api-logs', apiLogRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).send('Service is healthy');
});

module.exports = router;