const mongoose = require('mongoose');
const cron = require('node-cron');
const connectDB = require('../config/db');
const User = require('../models/user_wrike_webwork'); // Adjust the path to your User model
require('dotenv').config();

// connectDB();

// Function to Generate New Token (Mock Function, Replace with Actual API Call)
const generateNewToken = async (timeDoctorId) => {
  return `new_token_${timeDoctorId}_${Date.now()}`;
};

// Scheduler: Updates Time Doctor Token Every 5 Minutes
const startScheduler = () => {
  cron.schedule('*/1 * * * *', async () => {
    console.log('Running token update job...');
    try {
      const users = await User.find();
      for (let user of users) {
        const newToken = await generateNewToken(user.timeDoctorId);
        await User.updateOne({ _id: user._id }, { timeDoctorToken: newToken });
        console.log(`Updated token for ${user.email}`);
      }
    } catch (error) {
      console.error('Error updating tokens:', error);
    }
  });

  console.log('Scheduler initialized, running every 2 minutes.');
};

module.exports = { startScheduler };