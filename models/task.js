const mongoose = require('mongoose');
const { create } = require('./project_map');
const { time } = require('console');
require('dotenv').config();

// Define Task Schema
const taskSchema = new mongoose.Schema({
  wrikeTaskId: {
    type: String,
    required: true,
    unique: true
  },
  webworkTaskId: {
    type: Number,
    required: true,
    unique: true
  },
  webworkProjectId: {
    type: Number,
    required: true, 
  },
  webworkUserId: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  wrikeStartDate: {
    type: Date,
    required: true,
  },
  wrikeEndDate:{
    type: Date,
    required: true,
  },
  wrikeEffort:
  {
    type: Number,
    required: true, 
  },
  timeSpent: {
    type: Number, 
    default:0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Task model
const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
