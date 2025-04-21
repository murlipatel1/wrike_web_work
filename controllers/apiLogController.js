const ApiLog = require('../models/api_log');
const { logDatabaseApiCall } = require('../services/apiLoggerService');

// Get all API logs sorted by timestamp in descending order
exports.getApiLogs = async (req, res) => {
  try {
    logDatabaseApiCall();
    const logs = await ApiLog.find().sort({ timestamp: -1 });
    
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching API logs:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};