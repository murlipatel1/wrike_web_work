const mongoose = require('mongoose');
require('dotenv').config();

// Define Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  wrikeId: { type: String, required: true, unique: true },
  webworkId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
