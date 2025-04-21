const axios = require('axios');
const config = require('../config');
const User = require('../models/user_wrike_webwork');
const { logWrikeApiCall, logDatabaseApiCall } = require('./apiLoggerService');
const { getWrikeToken } = require('./tokenService');

exports.getTaskDetails = async (taskId) => {
  try {
    logWrikeApiCall();
    const response = await axios.get(`${config.wrike.apiBase}/tasks/${taskId}?fields=[effortAllocation]`, {
      headers: {
        Authorization: `Bearer ${getWrikeToken()}`
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
    logWrikeApiCall();
    const response = await axios.get(`${config.wrike.apiBase}/folders/${projectId}`, {
      headers: {
        Authorization: `Bearer ${getWrikeToken()}`
      }
    });

    return response.data.data[0].title;
  } catch (error) {
    console.error('Error fetching task details from Wrike:', error.message);
    throw new Error('Failed to fetch task details from Wrike');
  }
};

exports.getWebworkId = async (wrikeUserId) => {
  try {
    logDatabaseApiCall();
    // Find the user in the database with the matching Wrike ID
    const user = await User.findOne({ wrikeId: wrikeUserId });

    if (!user) {
      console.error(`No user found with Wrike ID: ${wrikeUserId}`);
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Error fetching Web Work ID:', error.message);
    throw new Error('Failed to fetch Web Work ID');
  }
};

exports.updateTaskTime = async (taskId, timeSpent, date) => {
  try {
    const timeSpent2 = (timeSpent / 60).toFixed(3);
    console.log('Time Spent:', timeSpent2);

    logWrikeApiCall();
    const response = await axios.post(`${config.wrike.apiBase}/tasks/${taskId}/timelogs?hours=${timeSpent2}&trackedDate=${date}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getWrikeToken()}`
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

exports.updateTaskStatus = async (taskId, statusId) => {
  try {
    logWrikeApiCall();
    const response = await axios.put(
      `${config.wrike.apiBase}/tasks/${taskId}`,
      {
        customStatus: statusId
      },
      {
        headers: {
          Authorization: `Bearer ${getWrikeToken()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`Task ${taskId} status updated to ${statusId}`);
    return response.data.data[0];
  } catch (error) {
    console.error('Error updating task status in Wrike:', error.message);
    throw new Error('Failed to update task status in Wrike');
  }
};

exports.getTaskTimeSpent = async (taskId) => {
  try {
    logWrikeApiCall();
    const response = await axios.get(`${config.wrike.apiBase}/tasks/${taskId}/timelogs`, {
      headers: {
        Authorization: `Bearer ${getWrikeToken()}`
      }
    });
    if (response.data.data.length === 0) {
      console.log('No time logs found for this task.');
      return 0;
    }
    const timeSpent = response.data.data.reduce((acc, log) => acc + log.hours, 0) * 60;
    console.log('Time Spent:', timeSpent);

    return timeSpent;

  } catch (error) {
    console.error('Error fetching task time spent from Wrike:', error.message);
    throw new Error('Failed to fetch task time spent from Wrike');
  }
}