require('dotenv').config(); // 1. Load env variables first

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const connectDB = require('./config/db');
const { startTaskScheduler } = require('./utils/taskScheduler');
const { startApiLogger } = require('./services/apiLoggerService');
const { initializeTokens } = require('./services/tokenService');

const PORT = process.env.PORT || 5000;

const app = express();

async function startServer() {
  try {
    // 2. Connect to MongoDB
    await connectDB();

    // 3. Middleware
    app.use(bodyParser.json());
    app.use(cors());

    // 4. Initialize tokens from database
    console.log('Initializing tokens...');
    await initializeTokens();
    console.log('Tokens initialized successfully');

    // 5. Routes
    app.use('/api', routes);

    // 6. Start schedulers/services
    startTaskScheduler();
    startApiLogger();

    // 7. Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err.stack);
      res.status(500).send('Server error');
    });

    // 8. Start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1); // Exit if initialization fails
  }
}

startServer();


