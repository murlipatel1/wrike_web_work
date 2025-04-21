const ApiLog = require('../models/api_log');
const cron = require('node-cron');
const { getWebworkTokenExpiryDays } = require('./tokenService');
const nodemailer = require('nodemailer');
const config = require('../config');

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

// Function to check WebWork token expiry and send email notification if needed
const checkTokenExpiry = async () => {
  try {
    console.log('Checking WebWork token expiry...');
    const expiryInfo = await getWebworkTokenExpiryDays();

    // Check if token is about to expire (3 days or less)
    if (expiryInfo.daysRemaining <= 3) {
      console.log(`WebWork token expires in ${expiryInfo.daysRemaining} days. Sending notification email...`);

      // Create email transporter
      const transporter = nodemailer.createTransport({
        service: config.email.host,
        port: 587,
        secure: false,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });

      // Email content
      const mailOptions = {
        from: `"Wrike Integration - Support" ${config.email.user}`,
        to: config.email.receiver,
        subject: `URGENT: WebWork Token Expires in ${expiryInfo.daysRemaining} Days`,
        html: `
          <h2>WebWork Token Expiry Notification</h2>
          <p>Your WebWork token will expire in <strong>${expiryInfo.daysRemaining} days</strong> (on ${expiryInfo.expiryDate.toDateString()}).</p>
          <p>Please update your WebWork token as soon as possible to ensure uninterrupted service.</p>
          <p>Last updated: ${expiryInfo.updatedAt.toDateString()}</p>
        `
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log('Token expiry notification email sent:', info.messageId);
    } else {
      console.log(`WebWork token expires in ${expiryInfo.daysRemaining} days. No notification needed.`);
    }
  } catch (error) {
    console.error('Error checking token expiry:', error.message);
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

      // Check token expiry after cleanup
      await checkTokenExpiry();
    } catch (error) {
      console.error('API logs cleanup scheduler error:', error.message);
    }
  });

  console.log('API logger initialized, logging every minute');
  console.log('API logs cleanup and token expiry check scheduled to run daily at midnight');
};

module.exports = {
  logWrikeApiCall,
  logWebworkApiCall,
  logDatabaseApiCall,
  startApiLogger,
  cleanupOldApiLogs,
  checkTokenExpiry
};