const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const routes = require('./routes');
const connectDB = require('./config/db');
const { startTaskScheduler } = require('./utils/taskScheduler');
const { startApiLogger } = require('./services/apiLoggerService');
const { initializeTokens} = require('./services/tokenService');

PORT = process.env.PORT || 5000;
const cors = require('cors');
const app = express();

// Connect to MongoDB
connectDB(); // Connect to MongoDB

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Initialize tokens from database
(async () => {
  try {
    await initializeTokens();
    console.log('Tokens initialized successfully');
  } catch (error) {
    console.error('Error initializing tokens:', error.message);
  }
})();

// Routes
app.use('/api', routes);

// Start schedulers
startTaskScheduler();
startApiLogger();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('Server error');
});

// Start server 
app.listen(PORT, async () => {
  console.log('Server running on http://localhost:5000');

});


