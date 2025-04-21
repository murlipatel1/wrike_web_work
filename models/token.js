const mongoose = require('mongoose');
require('dotenv').config();

// Define Schema for Tokens
const tokenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['wrike', 'webwork']
  },
  token: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Token model
const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;