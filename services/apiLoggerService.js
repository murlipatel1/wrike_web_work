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

  console.log('API logger initialized, logging every minute');
};

// // Function to get API logs for a specific time range
// const getApiLogs = async (startDate, endDate) => {
//   try {
//     const query = {};
//     if (startDate && endDate) {
//       query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     } else if (startDate) {
//       query.timestamp = { $gte: new Date(startDate) };
//     } else if (endDate) {
//       query.timestamp = { $lte: new Date(endDate) };
//     }
    
//     return await ApiLog.find(query).sort({ timestamp: -1 });
//   } catch (error) {
//     console.error('Error fetching API logs:', error.message);
//     throw new Error('Failed to fetch API logs');
//   }
// };

module.exports = {
  logWrikeApiCall,
  logWebworkApiCall,
  logDatabaseApiCall,
  startApiLogger,
//   getApiLogs
};