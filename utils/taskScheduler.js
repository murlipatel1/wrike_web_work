const cron = require("node-cron");
const Task = require("../models/task");
const webworkService = require("../services/webworkService");
const wrikeService = require("../services/wrikeService");
const config = require("../config");

const checkAndUpdateTaskStatus = async () => {
  try {
    console.log("Starting scheduled task status check...");
    // Get all tasks from the database
    const tasks = await Task.find();
    console.log(`Found ${tasks.length} tasks to check`);

    for (const task of tasks) {
      try {
        // Get time spent on the task from WebWork
        const timeSpentinwebwork = await webworkService.getTaskTime(task);
        console.log(
          `Task ${task.wrikeTaskId}: Time spent = ${timeSpentinwebwork} minutes, Effort = ${task.wrikeEffort} minutes`
        );

        //get timespent from db by task.webwworkTaskId
        const timeSpentfromdb = task.timeSpent;

        const timeSpent = timeSpentinwebwork - timeSpentfromdb;

        // used time db fetch of wrike time and subtract from given timeSpend newtime>0 then update wrike time
        //update db with old time spend of task

        const date = new Date().toISOString().split("T")[0];
        if (timeSpent > 0) {
          await wrikeService.updateTaskTime(task.wrikeTaskId, timeSpent, date);
          console.log(
            `Logged ${timeSpent} minutes for task ${task.wrikeTaskId}`
          );
          // Update the time spent in the database by timeSpentinwebwork
          await webworkService.updateTaskTimeinDB(
            task.wrikeTaskId,
            timeSpentinwebwork
          );
        }

        const timeSpent2 = await wrikeService.getTaskTimeSpent(
          task.wrikeTaskId
        );

        // Check if current date is past the end date or time spent exceeds effort
        const currentDate = new Date();
        const endDate = new Date(task.wrikeEndDate);
        const startDate = new Date(task.wrikeStartDate);

        // wrike api to get time spend on task then task its time spend
        if (
          timeSpent2 > task.wrikeEffort ||
          currentDate > endDate ||
          currentDate < startDate
        ) {
          console.log(
            `Task ${
              task.wrikeTaskId
            } needs to be completed: Time spent = ${timeSpent}, Effort = ${
              task.wrikeEffort
            }, End date = ${endDate.toISOString()}`
          );

          // Update task status in Wrike to completed
          await wrikeService.updateTaskStatus(
            task.wrikeTaskId,
            config.wrike.completedStatusId
          );
        }

        const taskDetails = await wrikeService.getTaskDetails(task.wrikeTaskId);
        // console.log("Task Details:", taskDetails);
        await webworkService.updateTaskEffortinDB(
          task.wrikeTaskId,
          taskDetails.effortAllocation.totalEffort
        );
      } catch (error) {
        console.error(
          `Error processing task ${task.wrikeTaskId}:`,
          error.message
        );
      }
    }
    console.log("Scheduled task status check completed");
  } catch (error) {
    console.error("Error in checkAndUpdateTaskStatus:", error.message);
  }
};

const startTaskScheduler = () => {
  // Run every 2 hours  '0 */2 * * *'
  // Run every 1 minute '*/1 * * * *'
  cron.schedule("*/10 * * * *", async () => {
    try {
      await checkAndUpdateTaskStatus();
    } catch (error) {
      console.error("Task status check scheduler error:", error.message);
    }
  });

  console.log("Task status check scheduler initialized, running every 2 hours");
};

module.exports = { startTaskScheduler, checkAndUpdateTaskStatus };
