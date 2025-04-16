const mongoose = require('mongoose');
require('dotenv').config();

// Define Schema for API Logs
const apiLogSchema = new mongoose.Schema({
  wrikeApiCalls: {
    type: Number,
    required: true,
    default: 0
  },
  webworkApiCalls: {
    type: Number,
    required: true,
    default: 0
  },
  databaseApiCalls: {
    type: Number,
    required: true,
    default: 0
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Create and export the API Log model
const ApiLog = mongoose.model('ApiLog', apiLogSchema);
module.exports = ApiLog;