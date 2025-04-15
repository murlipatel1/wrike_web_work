const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const routes = require('./routes');
const connectDB = require('./config/db');
const { loadTokenFromDB } = require('./utils/tokenManager');

PORT = process.env.PORT || 5000;
const cors = require('cors');
const app = express();

// Connect to MongoDB
connectDB(); // Connect to MongoDB

// Scheduler
// scheduler.startScheduler(); // Start the scheduler

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/', routes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('Server error');
});
// Start token refresh interval

// Start server
app.listen(PORT, async () => {
  console.log('Server running on http://localhost:5000');
  // await loadTokenFromDB();

  // setInterval(()=>{
  //   loadTokenFromDB();
  //   console.log('Token refreshed');
  // }, 50 * 60 * 1000); // Refresh token every 50 minutes
});

