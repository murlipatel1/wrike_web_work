const wrikeService = require('../services/wrikeService');
const timeDocService = require('../services/timeDocService');
const monitaskService = require('../services/monitaskService');
const config = require('../config/index');

exports.handleWebhook = async (req, res) => {
  try {
    console.log('Webhook received:', req.body);

    const taskID = req.body[0].taskId;
    console.log('Task ID:', taskID);

    // Get task details from Wrike
    const taskDetails = await wrikeService.getTaskDetails(taskID);
    console.log('Task details:', taskDetails);

    const task = {
      id: taskID,
      statusId: taskDetails.customStatusId,
      oldStatusId: req.body[0].oldCustomStatusId,
      title: taskDetails.title,
      description: taskDetails.description,
      assignedUserId: taskDetails.responsibleIds[0],
      projectID: taskDetails.parentIds[0],
      taskStartDate: taskDetails.dates.start
    };

    // Check if task status changed to "In Progress"
    if (taskDetails.responsibleIds.length == 1 && task.statusId === config.wrike.inProgressStatusId &&
      task.oldStatusId !== config.wrike.inProgressStatusId) {

      const monitaskUser = await wrikeService.getMonitaskId(task.assignedUserId);
      console.log('Monitask User ID:', monitaskUser);

      const projectName = await wrikeService.getProjectName(task.projectID);
      console.log('Project Name:', projectName);

      // get monitask project id from db by task.projectId
      const monitaskProjectId = await monitaskService.getMonitaskProjectId(task.projectID, projectName, monitaskUser.monitaskId);
      console.log('Monitask Project ID:', monitaskProjectId);

      //create task in monitask
      const monitaskTaskId = await monitaskService.createMonitaskTask(monitaskProjectId, task , monitaskUser.monitaskId);
      console.log('Monitask Task ID:', monitaskTaskId);
      
    }

    // Check if task status changed from "In Progress"
    console.log('Task Status:', task.statusId);
    console.log('Old Task Status:', task.oldStatusId);
    console.log('In Progress Status:', config.wrike.inProgressStatusId);

    if (task.statusId !== config.wrike.inProgressStatusId && task.oldStatusId === config.wrike.inProgressStatusId) {

      //get monitask task id from db by task.id
      const monitaskTask = await monitaskService.getMonitaskTaskId(task.id);
      console.log('Monitask Task ID:', monitaskTask);

      const monitaskTaskId = monitaskTask.monitaskTaskId;

      const timeDoctorUser = await wrikeService.getTimeDoctorId(task.assignedUserId);
      console.log('Time Doctor User ID:', timeDoctorUser);

      const timeSpent = await timeDocService.getTimeSpentOfTask(companyID, timeDocStartDate,timeDoctorUser.timedoctorId, timeDocTaskId );
      console.log('Time Spent:', timeSpent);

      const timeDocStartDate2 = new Date(timeDocStartDate).toISOString().toString();
      const dateOnly = timeDocStartDate2.split("T")[0];

      console.log('bahar Date Only:', dateOnly);
      console.log('bahar time spent:', timeSpent);
      console.log('bahar Task ID:', task.id);
      //call this api /tasks/{task.id}/timelogs?hours={timespent/3600}&trackedDate={dateOnly}
      if(timeSpent > 0) await wrikeService.updateTaskTime(task.id, timeSpent, dateOnly);

      // delete the task from db by task.id
      await timeDocService.deleteTimeDocTask(task.id);

      //delete the task from timeDoctor by task.id
      await timeDocService.deleteTimeDocTaskFromTimeDoctor(timeDocTaskId, companyID);
    }
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Server error');
  }
}; 