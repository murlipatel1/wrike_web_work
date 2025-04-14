const express = require('express');
const wrikeRoutes = require('./wrikeRoutes');

const router = express.Router();

// Mount route groups
router.use('/wrike', wrikeRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).send('Service is healthy');
});

module.exports = router;