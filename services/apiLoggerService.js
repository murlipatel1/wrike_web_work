const ApiLog = require('../models/api_log');
const cron = require('node-cron');

// Counters for API calls
let wrikeApiCalls = 0;
let webworkApiCalls = 0;
let databaseApiCalls = 0;

// Function to increment Wrike API call counter
const logWrikeApiCall = () => {
  wrikeApiCalls++;
};

// Function to increment WebWork API call counter
const logWebworkApiCall = () => {
  webworkApiCalls++;
};

// Function to increment Database API call counter
const logDatabaseApiCall = () => {
  databaseApiCalls++;
};

// Function to save the current counters to the database and reset them
const saveApiLogs = async () => {
  try {
    // Create a new log entry with the current counters
    logDatabaseApiCall(); // Assuming this is the function to increment the database counter

    const apiLog = new ApiLog({
      wrikeApiCalls,
      webworkApiCalls,
      databaseApiCalls,
      timestamp: new Date()
    });

    // Save to database
    await apiLog.save();
    console.log(`API Log saved: Wrike: ${wrikeApiCalls}, WebWork: ${webworkApiCalls}, DB: ${databaseApiCalls}`);

    // Reset counters after saving
    wrikeApiCalls = 0;
    webworkApiCalls = 0;
    databaseApiCalls = 0;
  } catch (error) {
    console.error('Error saving API logs:', error.message);
  }
};

// Function to delete old API logs (older than 3 days)
const cleanupOldApiLogs = async () => {
  try {
    // Calculate date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    // Delete logs older than 3 days
    const result = await ApiLog.deleteMany({ timestamp: { $lt: threeDaysAgo } });
    
    console.log(`Cleaned up ${result.deletedCount} API logs older than 3 days`);
  } catch (error) {
    console.error('Error cleaning up old API logs:', error.message);
  }
};

// Function to start the API logging scheduler
const startApiLogger = () => {
  // Schedule to run every minute
  cron.schedule('* * * * *', async () => {
    try {
      await saveApiLogs();
    } catch (error) {
      console.error('API logger scheduler error:', error.message);
    }
  });

  // Schedule cleanup to run every day at midnight (12 AM)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Starting API logs cleanup...');
      await cleanupOldApiLogs();
    } catch (error) {
      console.error('API logs cleanup scheduler error:', error.message);
    }
  });

  console.log('API logger initialized, logging every minute');
  console.log('API logs cleanup scheduled to run daily at midnight');
};

module.exports = {
  logWrikeApiCall,
  logWebworkApiCall,
  logDatabaseApiCall,
  startApiLogger,
  cleanupOldApiLogs // Export for testing purposes
};