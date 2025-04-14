const axios = require('axios');
const ProjectMap = require('../models/project_map');
const Task = require('../models/task');
const { getAccessToken } = require('../utils/tokenManager');
const config = require('../config');

exports.getMonitaskProjectId = async (wrikeProjectId, projectName, monitaskUserId) => {
  try {
    // Check if mapping already exists in database
    const existingMapping = await ProjectMap.findOne({ wrikeProjectId });

    if (existingMapping) {
      console.log('Found existing Monitask project mapping:', existingMapping);
      //get projct details from monitask
      const monitaskProjectId = existingMapping.monitaskProjectId;
      const monitaskProjectDetails = await getMonitaskProjectDetails(monitaskProjectId);
      const assignedUsers = monitaskProjectDetails[0].assignedUsers;
      // map through assignedUsers and check if monitaskUserId is present
      if (assignedUsers.find(user => user.id === monitaskUserId)) {
        return existingMapping.monitaskProjectId;
      }
      else {
        //add assigned user to project by calling /projectid/assigeduserid
        await addUserToMonitaskProject(monitaskProjectId, monitaskUserId);
        return existingMapping.monitaskProjectId;
      }
    }

    // If no mapping exists, create a new project in Monitask
    console.log('No existing mapping found. Creating new Monitask project...');
    const monitaskProjectId = await createMonitaskProject(wrikeProjectId, projectName , monitaskUserId);
    return monitaskProjectId;
  } catch (error) {
    console.error('Error in getMonitaskProjectId:', error.message);
    throw new Error('Failed to get or create Monitask project ID');
  }
};

async function addUserToMonitaskProject(monitaskProjectId, monitaskUserId) {
  try {
    const accessToken = getAccessToken();
    const response = await axios.post(
      `${config.monitask.apiBase}/projectS/${monitaskProjectId}/addAssignees`,
      [
        {
          "userId": monitaskUserId
        }
      ],
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.data ||!response.data.id) {
      throw new Error('Invalid response from Monitask API'); 
    }
  } 
  catch (error) {
    console.error('Error adding user to Monitask project:', error.message);
    throw new Error('Failed to add user to Monitask project'); 
  }
}

async function getMonitaskProjectDetails(monitaskProjectId) {
  try {
    const accessToken = getAccessToken();
    const response = await axios.get(
      `${config.monitask.apiBase}/project/${monitaskProjectId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.data || !response.data.id) {
      throw new Error('Invalid response from Monitask API');
    }
    const monitaskProjectDetails = response.data;
    console.log('Monitask project details:', monitaskProjectDetails);
    return monitaskProjectDetails;
  }
  catch (error) {
    console.error('Error fetching Monitask project details:', error.message);
    throw new Error('Failed to fetch Monitask project details');
  }
}

async function createMonitaskProject(wrikeProjectId, projectName, monitaskUserId) {
  try {
    const accessToken = getAccessToken();

    const response = await axios.post(
      `${config.monitask.apiBase}/project`,
      {
        name: `${projectName}`,
        status: `1`,
        priority: '3',
        assignedUsers: [
          {
            "userId": monitaskUserId 
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data || !response.data.id) {
      throw new Error('Invalid response from Monitask API');
    }

    const monitaskProjectId = response.data.id;

    // Save mapping to database
    await saveProjectMapping(wrikeProjectId, monitaskProjectId);

    console.log(`Created new Monitask project with ID: ${monitaskProjectId}`);
    return monitaskProjectId;
  } catch (error) {
    console.error('Error creating Monitask project:', error.response?.data || error.message);
    throw new Error('Failed to create project in Monitask');
  }
}

async function saveProjectMapping(wrikeProjectId, monitaskProjectId) {
  try {
    const projectMap = new ProjectMap({
      wrikeProjectId,
      monitaskProjectId
    });

    await projectMap.save();
    console.log('Project mapping saved:', projectMap);
    return projectMap;
  } catch (error) {
    console.error('Error saving project mapping:', error.message);
    throw new Error('Failed to save project mapping');
  }
}

exports.createMonitaskTask = async (monitaskProjectId, task , monitaskUserid) => {
  try {
    const accessToken = getAccessToken();

    const response = await axios.post(
      //call /notes api
      `${config.monitask.apiBase2}/note`,
      {
        projectId: monitaskProjectId,
        text: task.title,
        description: task.description,
        assignees: [ 
          {
            "userId": monitaskUserid
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        } 
      }
    )
    if (!response.data ||!response.data.id) {
      throw new Error('Invalid response from Monitask API'); 
    }
    const monitaskTaskId = response.data.id;
    const wrikeTaskId = task.id;

    // Save mapping to database
    await saveTaskMapping(wrikeTaskId, monitaskTaskId);
    return response.data;

  } 
  catch (error) {
    console.error('Error creating Monitask task:', error.message);
    throw new Error('Failed to create task in Monitask'); 
  }
}

const saveTaskMapping = async (wrikeTaskId, monitaskTaskId) => {
  try {
    const taskMap = new Task({
      wrikeTaskId,
      monitaskTaskId
    }); 
    await taskMap.save();
    console.log('Task mapping saved:', taskMap);
    return taskMap;
  } 
  catch (error) {
    console.error('Error saving task mapping:', error.message);
    throw new Error('Failed to save task mapping'); 
  }
}

exports.getMonitaskTaskId = async (wrikeTaskId) => {
  try {
    const task = await Task.findOne({ wrikeTaskId });
    return task;
  }
  catch (error) {
    console.error('Error in getMonitaskTaskId:', error.message);
    throw new Error('Failed to get Monitask task ID'); 
  } 
}