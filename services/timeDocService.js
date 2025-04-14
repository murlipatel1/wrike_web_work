const axios = require('axios');
const config = require('../config');
const ProjectMap = require('../models/project_map');
const Task = require('../models/task');

exports.getCompanyId = async () => {
  try {
    const response = await axios.get(`${config.timeDoctor.apiBase}/companies`, {
      headers: {
        Authorization: `JWT ${config.timeDoctor.apiToken}`
      }
    });

    return response.data.data[0].company.id;
  } catch (error) {
    console.error('Error fetching company ID from Time Doctor:', error.message);
    throw new Error('Failed to fetch company ID from Time Doctor');
  }
};

exports.createTask = async (companyId, projectId, task) => {
  try {
    const response = await axios.post(
      `${config.timeDoctor.apiBase}/tasks?company=${companyId}`,
      {
        "project": {
          "id": projectId,
          "weight": 0
        },
        "name": task.title,
        "description": task.description,
        "weight": 0,
        "status": "active",
        "public": true
      },
      {
        headers: {
          Authorization: `JWT ${config.timeDoctor.apiToken}`
        }
      }
    );
    const TDtaskId = response.data.data.id;
    const wrikeTaskId = task.id;

    const taskDate= (task.taskStartDate).toString();
    //call api to insert the td task id and wrike task id in mongodb.
    const newtask = new Task({
      wrikeTaskId: wrikeTaskId,
      timeDocTaskId: TDtaskId,
      wrikeTaskCreatedDate: taskDate,
    });

    await newtask.save();
    console.log('Task saved:', newtask);

    console.log('Task sent to Time Doctor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating task in Time Doctor:', error.response?.data || error.message);
    throw new Error('Failed to create task in Time Doctor');
  }
};

exports.getProjectMapping = async (wrikeProjectId, timeDoctorUserId) => {
  try {
    const projectMap = await ProjectMap.findOne({
      wrikeProjectId: wrikeProjectId,
      timeDoctorUserId: timeDoctorUserId
    });

    return projectMap;
  } catch (error) {
    console.error('Error fetching project mapping:', error.message);
    throw new Error('Failed to fetch project mapping');
  }
};

exports.saveProjectMapping = async (wrikeProjectId, timeDoctorUserId, timeDoctorProjectId) => {
  try {
    const projectMap = new ProjectMap({
      wrikeProjectId,
      timeDoctorUserId,
      timeDoctorProjectId
    });

    await projectMap.save();
    console.log('Project mapping saved:', projectMap);
    return projectMap;
  } catch (error) {
    console.error('Error saving project mapping:', error.message);
    throw new Error('Failed to save project mapping');
  }
};

exports.createProject = async (companyId, projectName, projectId, timeDoctorUserId, timeDoctoremail) => {
  try {
    // Check if project mapping already exists
    const existingMapping = await this.getProjectMapping(projectId, timeDoctorUserId);

    if (existingMapping) {
      console.log('Using existing project mapping:', existingMapping);
      return { id: existingMapping.timeDoctorProjectId };
    }

    const getName = timeDoctoremail.split('@')[0];
    const response = await axios.post(
      `${config.timeDoctor.apiBase}/projects?company=${companyId}`,
      {
        "scope": "workspace",
        "users": [
          {
            "id": timeDoctorUserId,
            "role": "user"
          }
        ],
        "name": `${projectName} - ${getName}`,
        "description": `Project created from Wrike: ${projectName}`,
        "deleted": false,
        "weight": 0
      },
      {
        headers: {
          Authorization: `JWT ${config.timeDoctor.apiToken}`
        }
      }
    );

    console.log('Project created in Time Doctor:', response.data);

    // Save the project mapping
    await this.saveProjectMapping(projectId, timeDoctorUserId, response.data.data.id);

    return response.data.data;
  } catch (error) {
    console.error('Error creating project in Time Doctor:', error.response?.data || error.message);
    throw new Error('Failed to create project in Time Doctor');
  }
};

exports.getTasks = async (companyId) => {
  try {
    const response = await axios.get(`${config.timeDoctor.apiBase}/tasks?company=${companyId}`, {
      headers: {
        Authorization: `JWT ${config.timeDoctor.apiToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching tasks from Time Doctor:', error.message);
    throw new Error('Failed to fetch tasks from Time Doctor');
  }
};

exports.getTimeDocTaskId = async (wrikeTaskId) => {
  try {
    const task = await Task.findOne({ wrikeTaskId: wrikeTaskId });
    return task; 
  } 
  catch (error) {
    console.error('Error fetching TimeDoc task ID:', error.message);
    throw new Error('Failed to fetch TimeDoc task ID'); 
  }
}

exports.getTimeSpentOfTask = async (companyID, timeDocStartDate,timedoctorUserId,timeDocTaskId) => {
  try {

    // https://api2.timedoctor.com/api/1.1/stats/total?company=Z-EhbjBSbqIpi64N&from=2025-03-24T09%3A00%3A00.141Z&to=2025-03-27T15%3A30%3A00.141Z&user=Z-EK7zBSbqIpf8AI&task=Z-Uck0iBr9BODEKT&period=days

    const currentDate = new Date(); // Get current date
    currentDate.setMinutes(currentDate.getMinutes() + 30); // Add 30 minutes
    const updatedDate = currentDate.toISOString(); // Convert to ISO format
    console.log('Updated Date: 30 min : ', updatedDate);

    
    const timeDocStartDate2 = new Date(timeDocStartDate).toISOString().toString();

    console.log('TimeDoc Start Date:', timeDocStartDate2);

    const response = await axios.get(`${config.timeDoctor.apiBase2}/stats/total?company=${companyID}&from=${timeDocStartDate2}&to=${updatedDate}&user=${timedoctorUserId}&task=${timeDocTaskId}`, {
      headers: {
        Authorization: `JWT ${config.timeDoctor.apiToken}`
      }
    }); 
    console.log('Time spent on task:', response.data.data);

    return response.data.data.length !== 0 ? response.data.data[0].total : 0;
  }
  catch (error) {
    console.error('Error fetching TimeDoc task ID.........:', error.message);
    throw new Error('Failed to fetch TimeDoc task ID......'); 
  } 
}

exports.deleteTimeDocTask = async(wrikeTaskId) => {
  try {
    await Task.deleteOne({ wrikeTaskId: wrikeTaskId });
    console.log('Task deleted from MongoDB:', wrikeTaskId); 
  }
  catch (error) {
    console.error('Error deleting task from MongoDB:', error.message);
    throw new Error('Failed to delete task from MongoDB'); 
  } 
}

exports.deleteTimeDocTaskFromTimeDoctor = async(timeDocTaskId, companyID) => {
  try {
    await axios.delete(`${config.timeDoctor.apiBase}/tasks/${timeDocTaskId}?company=${companyID}`, {
      headers: {
        Authorization: `JWT ${config.timeDoctor.apiToken}`
      }
    });
    console.log('Task deleted from Time Doctor:', timeDocTaskId);
  }
  catch (error) {
    console.error('Error deleting task from Time Doctor:', error.message);
    throw new Error('Failed to delete task from Time Doctor');
  } 
}