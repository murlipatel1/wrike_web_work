const axios = require('axios');
const config = require('../config');
const User = require('../models/user_wrike_monitask');

/**
 * Get task details from Wrike API
 * @param {string} taskId - The Wrike task ID
 * @returns {Promise<Object>} - Task details
 */
exports.getTaskDetails = async (taskId) => {
  try {
    const response = await axios.get(`${config.wrike.apiBase}/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${config.wrike.webhookSecret}`
      }
    });
    
    return response.data.data[0];
  } catch (error) {
    console.error('Error fetching task details from Wrike:', error.message);
    throw new Error('Failed to fetch task details from Wrike');
  }
};

exports.getProjectName = async (projectId) => {
  try {
    const response = await axios.get(`${config.wrike.apiBase}/folders/${projectId}`, {
      headers: {
        Authorization: `Bearer ${config.wrike.webhookSecret}`
      }
    });
    
    return response.data.data[0].title;
  } catch (error) {
    console.error('Error fetching task details from Wrike:', error.message);
    throw new Error('Failed to fetch task details from Wrike');
  }
};

exports.getMonitaskId = async (wrikeUserId) => {
  try {
    // Find the user in the database with the matching Wrike ID
    const user = await User.findOne({ wrikeId: wrikeUserId });
    
    if (!user) {
      console.error(`No user found with Wrike ID: ${wrikeUserId}`);
      throw new Error('User not found');
    }
    
    console.log(`Found Time Doctor ID: ${user.monitaskId} for Wrike user: ${wrikeUserId}`);
    return user;
  } catch (error) {
    console.error('Error fetching Time Doctor ID:', error.message);
    throw new Error('Failed to fetch Time Doctor ID');
  }
};


//call this api /tasks/{task.id}/timelogs?hours={timespent/3600}&trackedDate={dateOnly}
exports.updateTaskTime = async (taskId, timeSpent, date) => {
  try {
    const timeSpent2 = (timeSpent / 3600).toFixed(3);
    console.log('Time Spent:', timeSpent2);
    console.log('Date:', date);
    console.log('Task ID:', taskId);
    console.log('API Base:', config.wrike.apiBase);
    const response = await axios.post(`${config.wrike.apiBase}/tasks/${taskId}/timelogs?hours=${timeSpent2}&trackedDate=${date}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${config.wrike.webhookSecret}`
        }
      }
    );
    console.log('Task time updated:---------', response.data);
    return response.data;
  }
  catch (error) {
    console.error('Error updating task time:', error.message);
    throw new Error('Failed to update task time');
  }
}