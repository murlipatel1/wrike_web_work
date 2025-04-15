const wrikeService = require('../services/wrikeService');
const webworkService = require('../services/webworkService');
const config = require('../config/index');

exports.handleWebhook = async (req, res) => {
  try {
    console.log('Webhook received:', req.body);

    const taskID = req.body[0].taskId;
    console.log('Task ID:', taskID);

    // Get task details from Wrike
    const taskDetails = await wrikeService.getTaskDetails(taskID);

    const task = {
      id: taskID,
      statusId: taskDetails.customStatusId,
      oldStatusId: req.body[0].oldCustomStatusId,
      title: taskDetails.title,
      description: taskDetails.description,
      assignedUserId: taskDetails.responsibleIds[0],
      projectID: taskDetails.superParentIds[0],
      taskStartDate: taskDetails.dates.start,
      taskEndDate: taskDetails.dates.end,
      efforts : taskDetails.effortAllocation.totalEffort
    };

    if (taskDetails.parentIds[0] != config.wrike.rootFolderId)
    {
      task.projectID = taskDetails.parentIds[0];
    }



    // console.log('Task Details:', taskDetails);
    if (taskDetails.responsibleIds.length == 1 && task.statusId === config.wrike.inProgressStatusId &&
      task.oldStatusId !== config.wrike.inProgressStatusId) {

      const webworkUser = await wrikeService.getWebworkId(task.assignedUserId);
      
      const projectName = await wrikeService.getProjectName(task.projectID);
      console.log('Project Name:', projectName);

      // get webwork project id from db by task.projectId
      const webworkProjectId = await webworkService.getWebworkProjectId(task.projectID, projectName, webworkUser.webworkId);
      console.log('Webwork Project ID:', webworkProjectId);

      //create task in webwork
      const webworkTaskId = await webworkService.createWebworkTask(webworkProjectId, task , webworkUser.webworkId);
      console.log('Task created in WebWork');
      

    }

    if (task.statusId !== config.wrike.inProgressStatusId && task.oldStatusId === config.wrike.inProgressStatusId) {

      //get webwork task id from db by task.id
      const webworkTask = await webworkService.getWebworkTaskId(task.id);
      console.log('Webwork Task ID:', webworkTask);

      const webworkUserId = webworkTask.webworkUserId;
      //get webwork projectid from db by task.projectId
      const webworkProjectId = await webworkService.getWebworkProjectID(task.projectID);
      console.log('Webwork Project ID:', webworkProjectId);

      //get time of task in webwork
      const timeSpent = await webworkService.getTaskTime(webworkTask);
      console.log('Time Spent:', timeSpent);

      // todays date yyyy-mm-dd
      const date = new Date().toISOString().split('T')[0];
      console.log('Date:', date);

      //call this api /tasks/{task.id}/timelogs?hours={timespent/3600}&trackedDate={dateOnly}
      if(timeSpent > 0) await wrikeService.updateTaskTime(task.id, timeSpent, date);

      // delete the task from db by task.id
      await webworkService.deleteWebworkTask(webworkTask.webworkTaskId);

      //delete the task from webwork by task.id
      await webworkService.deleteWebworkTaskFromWebwork(webworkTask.webworkTaskId);

      // get all tasks from task db by userId
      await webworkService.removeAssignee(webworkUserId, webworkProjectId);

    }

    //every 2 hours..get all tasks from task db then call getTaskTime function for each task..
    //check if the time returned is > task.wrikeEffort or date.now > task.wrikeEndDate.. 
    // then call wrike update status api to make status completed 
    // put request /tasks/taskid?customStatus=config.wrike.completedStatusId
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Server error');
  }
}; 