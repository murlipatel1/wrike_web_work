const mongoose = require('mongoose');
require('dotenv').config();

// Define Task Schema
const taskSchema = new mongoose.Schema({
  wrikeTaskId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  monitaskTaskId: { 
    type: Number, 
    required: true, 
    unique: true 
  },
});

// Create and export the Task model
const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
