const wrikeService = require("../services/wrikeService");
const webworkService = require("../services/webworkService");
const config = require("../config/index");

exports.handleWebhook = async (req, res) => {
  try {
    console.log("Webhook received:", req.body);

    const taskID = req.body[0].taskId;
    console.log("Task ID:", taskID);


    if (req.body[0].eventType === "TaskStatusChanged") {
      // Get task details from Wrike
      const taskDetails = await wrikeService.getTaskDetails(taskID);
      console.log("Task Details:", taskDetails);
      const taskTimeSpent = await wrikeService.getTaskTimeSpent(taskID);

      const task = {
        id: taskID,
        statusId: taskDetails.customStatusId,
        oldStatusId: req.body[0].oldCustomStatusId,
        title: taskDetails.title,
        description: taskDetails.description,
        assignedUserId: taskDetails.responsibleIds[0],
        projectID: taskDetails.superParentIds[0],
        taskStartDate: taskDetails.dates.start,
        taskEndDate: taskDetails.dates.due,
        efforts: taskDetails.effortAllocation.totalEffort,
        timeSpent: taskTimeSpent,
      };

      if (taskDetails.parentIds[0] != config.wrike.rootFolderId) {
        task.projectID = taskDetails.parentIds[0];
      }
      const currentDate = Date.now();
      const taskStartDate = new Date(taskDetails.dates.start);
      const taskEndDate = new Date(taskDetails.dates.due);

      // console.log('Task Details:', taskDetails);
      if (
        taskDetails.responsibleIds.length == 1 &&
        task.statusId === config.wrike.inProgressStatusId &&
        task.oldStatusId !== config.wrike.inProgressStatusId &&
        taskDetails.effortAllocation.totalEffort > 0 &&
        taskDetails.dates.start !== null &&
        taskDetails.dates.end !== null &&
        taskStartDate <= currentDate &&
        taskEndDate >= currentDate &&
        task.timeSpent < task.efforts
      ) {
        const webworkUser = await wrikeService.getWebworkId(
          task.assignedUserId
        );

        const projectName = await wrikeService.getProjectName(task.projectID);
        console.log("Project Name:", projectName);

        // get webwork project id from db by task.projectId
        const webworkProjectId = await webworkService.getWebworkProjectId(
          task.projectID,
          projectName,
          webworkUser.webworkId
        );
        console.log("Webwork Project ID:", webworkProjectId);

        //create task in webwork
        const webworkTaskId = await webworkService.createWebworkTask(
          webworkProjectId,
          task,
          webworkUser.webworkId
        );
        console.log("Task created in WebWork");
      }

      if (
        task.statusId !== config.wrike.inProgressStatusId &&
        task.oldStatusId === config.wrike.inProgressStatusId &&
        taskDetails.effortAllocation.totalEffort > 0 &&
        taskDetails.dates.start !== null &&
        taskDetails.dates.due !== null
      ) {
        //get webwork task id from db by task.id
        const webworkTask = await webworkService.getWebworkTaskId(task.id);
        console.log("Webwork Task ID:", webworkTask);

        const webworkUserId = webworkTask.webworkUserId;
        //get webwork projectid from db by task.projectId
        const webworkProjectId = await webworkService.getWebworkProjectID(
          task.projectID
        );
        console.log("Webwork Project ID:", webworkProjectId);

        // delete the task from db by task.id
        await webworkService.deleteWebworkTask(webworkTask.webworkTaskId);

        //delete the task from webwork by task.id
        await webworkService.deleteWebworkTaskFromWebwork(
          webworkTask.webworkTaskId
        );

        // get all tasks from task db by userId
        await webworkService.removeAssignee(webworkUserId, webworkProjectId);

        setTimeout(async () => {
          const timeSpent = await webworkService.getTaskTime(webworkTask);
          console.log("Time Spent:", timeSpent);

          // todays date yyyy-mm-dd
          const date = new Date().toISOString().split("T")[0];
          console.log("Date:", date);

          //call this api /tasks/{task.id}/timelogs?hours={timespent/3600}&trackedDate={dateOnly}
          if (timeSpent > 0)
            await wrikeService.updateTaskTime(task.id, timeSpent, date);
        }, 10 * 60 * 1000); // wait for 10 minute before getting time of task in webwork
      }
    }

    if (req.body[0].eventType === "TaskDatesChanged") {
      // update task start date and end date in db by task.id
      const wrikeTask = await webworkService.getWebworkTaskId(taskID);

      if (wrikeTask) {
        await webworkService.updateTaskDate(
          taskID,
          req.body[0].dates.startDate,
          req.body[0].dates.dueDate
        );
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Server error");
  }
};
