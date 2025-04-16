const axios = require("axios");
const ProjectMap = require("../models/project_map");
const Task = require("../models/task");
const User = require("../models/user_wrike_webwork");
const config = require("../config");
const { logDatabaseApiCall, logWebworkApiCall } = require("./apiLoggerService");

exports.getWebworkProjectId = async (
  wrikeProjectId,
  projectName,
  webworkUserId
) => {
  try {
    // Check if mapping already exists in database
    logDatabaseApiCall();
    const existingMapping = await ProjectMap.findOne({ wrikeProjectId });

    if (existingMapping) {
      console.log("Found existing Webwork project mapping:", existingMapping);
      //get projct details from webwork
      const webworkProjectId = existingMapping.webworkProjectId;
      const webworkProjectAssignees = await getWebworkProjectAssignees(
        webworkProjectId
      );

      // map through assignedUsers and check if webworkUserId is present
      if (webworkProjectAssignees.find((user) => user.id === webworkUserId)) {
        return existingMapping.webworkProjectId;
      } else {
        //add assigned user to project by calling /projectid/assigeduserid
        await addUserToWebworkProject(webworkProjectId, webworkUserId);
        return existingMapping.webworkProjectId;
      }
    }

    // If no mapping exists, create a new project in Webwork
    console.log("No existing mapping found. Creating new Webwork project...");
    const webworkProjectId = await createWebworkProject(
      wrikeProjectId,
      projectName,
      webworkUserId
    );
    return webworkProjectId;
  } catch (error) {
    console.error("Error in getWebworkProjectId:", error.message);
    throw new Error("Failed to get or create Webwork project ID");
  }
};

async function addUserToWebworkProject(webworkProjectId, webworkUserId) {
  try {
    logWebworkApiCall();
    const response = await axios.post(
      `${config.webwork.apiBase}/contracts`,

      {
        project_id: webworkProjectId,
        user_id: webworkUserId,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${config.webwork.apiUser}:${config.webwork.apiToken}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.data) {
      throw new Error("Invalid response from Webwork API");
    }
  } catch (error) {
    console.error("Error adding user to Webwork project:", error.message);
    throw new Error("Failed to add user to Webwork project");
  }
}

async function getWebworkProjectAssignees(webworkProjectId) {
  try {
    logWebworkApiCall();
    const response = await axios.get(`${config.webwork.apiBase}/contracts`, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${config.webwork.apiUser}:${config.webwork.apiToken}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.data) {
      throw new Error("Invalid response from Webwork API");
    }
    const userIds = response.data
      .filter((item) => item.project_id === webworkProjectId)
      .map((item) => item.user_id);
    return userIds;
  } catch (error) {
    console.error("Error fetching Webwork project details:", error.message);
    throw new Error("Failed to fetch Webwork project details");
  }
}

async function createWebworkProject(
  wrikeProjectId,
  projectName,
  webworkUserId
) {
  
  try {
    logWebworkApiCall();
    const response = await axios.post(
      `${config.webwork.apiBase}/projects`,
      {
        name: `${projectName}`,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${config.webwork.apiUser}:${config.webwork.apiToken}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data) {
      throw new Error("Invalid response from Webwork API");
    }
    const webworkProjectId = response.data.project.id;
    console.log("Webwork project ID:", webworkProjectId);

    //call addUserToWebworkProject
    await addUserToWebworkProject(webworkProjectId, webworkUserId);
    // Save mapping to database
    await saveProjectMapping(wrikeProjectId, webworkProjectId);
    console.log(`Created new Webwork project with ID: ${webworkProjectId}`);
    return webworkProjectId;
  } catch (error) {
    console.error(
      "Error creating Webwork project:",
      error.response?.data || error.message
    );
    throw new Error("Failed to create project in Webwork");
  }
}

async function saveProjectMapping(wrikeProjectId, webworkProjectId) {
  try {
    const projectMap = new ProjectMap({
      wrikeProjectId,
      webworkProjectId,
    });

    logDatabaseApiCall();
    await projectMap.save();
    return projectMap;
  } catch (error) {
    console.error("Error saving project mapping:", error.message);
    throw new Error("Failed to save project mapping");
  }
}

exports.createWebworkTask = async (webworkProjectId, task, webworkUserid) => {
  try {
    logWebworkApiCall();
    const response = await axios.post(
      //call /notes api
      `${config.webwork.apiBase}/tasks`,
      {
        project_id: webworkProjectId,
        title: task.title,
        description: task.description,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${config.webwork.apiUser}:${config.webwork.apiToken}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.data) {
      throw new Error("Invalid response from Webwork API");
    }
    const webworkTaskId = response.data.task.id;
    // assign user to task
    await addUserToWebworkTask(webworkTaskId, webworkUserid);
    const wrikeTaskId = task.id;

    //get email from db of user_wrike_webork by task.assignedUserId
    logDatabaseApiCall();
    const user = await User.findOne({ webworkId: webworkUserid });
    const email = user.email;

    console.log("task end date", task.taskEndDate);

    // Save mapping to database
    await saveTaskMapping(
      wrikeTaskId,
      webworkTaskId,
      email,
      webworkProjectId,
      task.taskStartDate,
      task.taskEndDate,
      task.efforts,
      webworkUserid
    );
    return response.data;
  } catch (error) {
    console.error("Error creating Webwork task:", error.message);
    throw new Error("Failed to create task in Webwork");
  }
};

const addUserToWebworkTask = async (webworkTaskId, webworkUserId) => {
  try {
    logWebworkApiCall();
    const response = await axios.get(
      `${config.webwork.apiBase}/tasks/assign/${webworkTaskId}/${webworkUserId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${config.webwork.apiUser}:${config.webwork.apiToken}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.data) {
      throw new Error("Invalid response from Webwork API............");
    }
  } catch (error) {
    console.error("Error adding user to Webwork task:", error.message);
    throw new Error("Failed to add user to Webwork task");
  }
};

const saveTaskMapping = async (
  wrikeTaskId,
  webworkTaskId,
  email,
  webworkProjectId,
  taskStartDate,
  taskEndDate,
  efforts,
  webworkUserId
) => {
  try {
    console.log("Saving task mapping:", {
      wrikeTaskId,
      webworkTaskId,
      email,
      webworkProjectId,
      taskStartDate,
      taskEndDate,
      efforts,
      webworkUserId,
    });

    const taskMap = new Task({
      wrikeTaskId,
      webworkTaskId,
      email,
      webworkProjectId,
      wrikeStartDate:taskStartDate,
      wrikeEndDate: taskEndDate,
      wrikeEffort: efforts,
      webworkUserId,
    });
    logDatabaseApiCall();
    await taskMap.save();
    return taskMap;
  } catch (error) {
    console.error("Error saving task mapping:", error.message);
    throw new Error("Failed to save task mapping");
  }
};

exports.getWebworkTaskId = async (wrikeTaskId) => {
  try {
    logDatabaseApiCall();
    const task = await Task.findOne({ wrikeTaskId });
    return task;
  } catch (error) {
    console.error("Error in getWebworkTaskId:", error.message);
    throw new Error("Failed to get Webwork task ID");
  }
};

exports.getWebworkProjectID = async (wrikeProjectId) => {
  try {
    logDatabaseApiCall();
    const project = await ProjectMap.findOne({ wrikeProjectId });
    return project.webworkProjectId;
  } catch (error) {
    console.error("Error in getWebworkProjectID:", error.message);
    throw new Error("Failed to get Webwork project ID");
  }
};

exports.getTaskTime = async (webworkTask) => {
  const start = new Date(webworkTask.createdAt);
  start.setDate(start.getDate() - 2);
  const start_date = start.toISOString().split("T")[0];

  const end = new Date();
  end.setDate(end.getDate() + 2);
  const end_date = end.toISOString().split("T")[0];

  //find email from db of user_wrike_webork by webworkTask.id
  const email = webworkTask.email;

  console.log("Start Date:", start_date);
  console.log("End Date:", end_date);

  // call this api after 4 minutes use set timout

  // First API call to get inactive minutes
  logWebworkApiCall();
  const reportResponse = await axios.get(
    `${config.webwork.apiBase}/reports/full-data?start_date=${start_date}&end_date=${end_date}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${config.webwork.apiUser}:${config.webwork.apiToken}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!reportResponse.data) {
    throw new Error("Invalid response from Webwork API");
  }
  // Find relevant report and task data
  const report = reportResponse.data.dateReport.find(
    (item) => item.email === email
  );
  const taskData = report?.tasks.find(
    (item) => item.taskId === webworkTask.webworkTaskId
  );

  console.log("Task Data: of report", taskData);

  // Return the difference between active minutes and budget minutes
  if (taskData) {
    mins = taskData?.minutes ? Number(taskData?.minutes) : 0;
    in_mins = taskData?.inactive_minutes ? taskData?.inactive_minutes : 0;
    return Math.max(mins - in_mins, 0);
  }
  return 0;
};

exports.deleteWebworkTask = async (webworkTaskId) => {
  try {
    logDatabaseApiCall();
    const task = await Task.findOneAndDelete({ webworkTaskId });
    return task;
  } catch (error) {
    console.error("Error deleting Webwork task:", error.message);
    throw new Error("Failed to delete Webwork task");
  }
};

exports.deleteWebworkTaskFromWebwork = async (webworkTaskId) => {
  try {
    logWebworkApiCall();
    const response = await axios.delete(
      `${config.webwork.apiBase}/tasks/${webworkTaskId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${config.webwork.apiUser}:${config.webwork.apiToken}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.data) {
      throw new Error("Invalid response from Webwork API");
    }
  } catch (error) {
    console.error("Error deleting Webwork task:", error.message);
    throw new Error("Failed to delete Webwork task");
  }
};

exports.removeAssignee = async (webworkUserId, webworkProjectId) => {
  try {
    logDatabaseApiCall();
    const tasks = await Task.find({ webworkUserId });
    console.log("Tasks:", tasks);
    //find in the tasks if there is a task with the given webworkProjectId
    const tasksInProject = tasks.filter(
      (task) => task.webworkProjectId === webworkProjectId
    );
    console.log("Tasks in project:", tasksInProject);
    if (tasksInProject.length === 0) {
      // make function to get all contracts of the user
      const contracts = await getContractsofProject(
        webworkProjectId,
        webworkUserId
      );
      console.log("Contractsss---", contracts);
      const contractid = contracts[0].id;

      //delete contract by contractid
      await deleteContract(contractid);
      return [];
    }

    // return tasksInProject;
  } catch (error) {
    console.error("Error getting Webwork tasks by user ID:", error.message);
    throw new Error("Failed to get Webwork tasks by user ID");
  }
};

const getContractsofProject = async (webworkProjectId, webworkUserId) => {
  try {
    logWebworkApiCall();
    const response = await axios.get(`${config.webwork.apiBase}/contracts`, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${config.webwork.apiUser}:${config.webwork.apiToken}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    console.log("getContractsofProject ", response.data);
    console.log("webworkProjectId ", webworkProjectId);
    console.log("webworkUserId ", webworkUserId);
    // filter the response according to webworkProjectId and webworkUserId
    const contracts = response.data.filter(
      (contract) =>
        contract.project_id === webworkProjectId &&
        contract.user_id === webworkUserId
    );

    return contracts;
  } catch (error) {
    console.error("Error getting Webwork tasks by user ID:", error.message);
    throw new Error("Failed to get Webwork tasks by user ID");
  }
};

const deleteContract = async (contractid) => {
  try {
    logWebworkApiCall();
    const response = await axios.delete(
      `${config.webwork.apiBase}/contracts/${contractid}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${config.webwork.apiUser}:${config.webwork.apiToken}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error deleting Webwork task:", error.message);
    throw new Error("Failed to delete Webwork task");
  }
};

exports.updateTaskTimeinDB = async (wrikeTaskId, timeSpent) => {
  //update the time spent in the database by timeSpentinwebwork
  try {
    logDatabaseApiCall();
    const response = await Task.findOneAndUpdate(
      { wrikeTaskId },
      { timeSpent },
      { new: true }
    );
    if (!response) {
      throw new Error("Task not found in database");
    }
    console.log("Task time updated in DB:", response);
  } catch (error) {
    console.error("Error updating task time in DB:", error.message);
    throw new Error("Failed to update task time in DB");
  }
};

exports.updateTaskEffortinDB = async (wrikeTaskId, effort) => {
  //update the effort in the database by wrikeTaskId
  try {
    logDatabaseApiCall();
    const response = await Task.findOneAndUpdate(
      { wrikeTaskId },
      { wrikeEffort: effort },
      { new: true }
    );
    if (!response) {
      throw new Error("Task not found in database");
    }
    console.log("Task effort updated in DB:", response);
  } catch (error) {
    console.error("Error updating task effort in DB:", error.message);
    throw new Error("Failed to update task effort in DB");
  }
}

exports.updateTaskDate = async (
  wrikeTaskId,
  taskStartDate,
  taskEndDate
) => {
  //update the task start date and end date in the database by wrikeTaskId
  try {
    logDatabaseApiCall();
    const response = await Task.findOneAndUpdate(
      { wrikeTaskId },
      { wrikeStartDate: taskStartDate, wrikeEndDate: taskEndDate },
      { new: true }
    );
    if (!response) {
      throw new Error("Task not found in database");
    }
    console.log("Task date updated in DB:", response);
  } catch (error) {
    console.error("Error updating task date in DB:", error.message);
    throw new Error("Failed to update task date in DB");
  }
}
