const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    refreshToken: String,
    updatedAt: { type: Date, default: Date.now },
  });
  
const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;