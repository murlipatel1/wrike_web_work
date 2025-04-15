const mongoose = require('mongoose');
require('dotenv').config();

// Define Schema
const projectMapSchema = new mongoose.Schema({
  wrikeProjectId: { type: String, required: true },
  webworkProjectId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ProjectMap = mongoose.model('ProjectMap', projectMapSchema);

module.exports = ProjectMap;
