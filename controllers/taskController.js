const Task = require('../models/task');
const webworkService = require('../services/webworkService');
const wrikeService = require('../services/wrikeService');
const config = require('../config');
const { logDatabaseApiCall } = require('../services/apiLoggerService');

// Get all tasks sorted by date descending
exports.getAllTasks = async (req, res) => {
  try {
    logDatabaseApiCall();
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete task by WebWork ID
exports.deleteTask = async (req, res) => {
  try {
    const { webworkTaskId } = req.params;
    // Find task in database
    logDatabaseApiCall();
    const task = await Task.findOne({ webworkTaskId: parseInt(webworkTaskId) });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // Delete task from WebWork if it exists
    try {
      await webworkService.deleteWebworkTaskFromWebwork(parseInt(webworkTaskId));
      console.log(`Task ${webworkTaskId} deleted from WebWork`);
    } catch (error) {
      console.error(`Error deleting task ${webworkTaskId} from WebWork:`, error.message);
      // Continue with deletion from DB even if WebWork deletion fails
    }
    
    // Get Wrike task status
    const wrikeTaskDetails = await wrikeService.getTaskDetails(task.wrikeTaskId);
    
    // If status is not "To Do", change it
    if (wrikeTaskDetails.customStatusId !== config.wrike.todoStatusId) {
      await wrikeService.updateTaskStatus(task.wrikeTaskId, config.wrike.todoStatusId);
      console.log(`Task ${task.wrikeTaskId} status changed to To Do in Wrike`);
    }
    
    // Delete task from database
    logDatabaseApiCall();
    await Task.findOneAndDelete({ webworkTaskId: parseInt(webworkTaskId) });
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};