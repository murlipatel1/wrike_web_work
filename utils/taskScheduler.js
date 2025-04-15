const cron = require('node-cron');
const Task = require('../models/task');
const webworkService = require('../services/webworkService');
const wrikeService = require('../services/wrikeService');
const config = require('../config');

const checkAndUpdateTaskStatus = async () => {
    try {
        console.log('Starting scheduled task status check...');
        // Get all tasks from the database
        const tasks = await Task.find();
        console.log(`Found ${tasks.length} tasks to check`);

        for (const task of tasks) {
            try {
                // Get time spent on the task from WebWork
                const timeSpent = await webworkService.getTaskTime(task);
                console.log(`Task ${task.wrikeTaskId}: Time spent = ${timeSpent} minutes, Effort = ${task.wrikeEfforts} minutes`);

                // Check if current date is past the end date or time spent exceeds effort
                const currentDate = new Date();
                const endDate = new Date(task.wrikeEndDate);

                if (timeSpent > task.wrikeEffort || currentDate > endDate) {
                    console.log(`Task ${task.wrikeTaskId} needs to be completed: Time spent = ${timeSpent}, Effort = ${task.wrikeEfforts}, End date = ${endDate.toISOString()}`);

                    // Update task status in Wrike to completed
                    await updateTaskInWrike(task, timeSpent);
                }

                // Log time spent on the task
                const date = new Date().toISOString().split('T')[0];
                if (timeSpent > 0) {
                    await wrikeService.updateTaskTime(task.wrikeTaskId, timeSpent, date);
                    console.log(`Logged ${timeSpent} minutes for task ${task.wrikeTaskId}`);
                }

            } catch (error) {
                console.error(`Error processing task ${task.wrikeTaskId}:`, error.message);
            }
        }
        console.log('Scheduled task status check completed');
    } catch (error) {
        console.error('Error in checkAndUpdateTaskStatus:', error.message);
    }
};

async function updateTaskInWrike(task, timeSpent) {
    try {
        // Update task status in Wrike to completed
        await wrikeService.updateTaskStatus(task.wrikeTaskId, config.wrike.completedStatusId);
        console.log(`Updated task ${task.wrikeTaskId} status to completed`);

    } catch (error) {
        console.error(`Error updating task ${task.wrikeTaskId} in Wrike:`, error.message);
        throw error;
    }
}

const startTaskScheduler = () => {
    // Run every 2 hours
    cron.schedule('0 */2 * * *', async () => {
        try {
            await checkAndUpdateTaskStatus();
        } catch (error) {
            console.error('Task status check scheduler error:', error.message);
        }
    });

    console.log('Task status check scheduler initialized, running every 2 hours');
};

module.exports = { startTaskScheduler, checkAndUpdateTaskStatus };