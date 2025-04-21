// Configuration settings
module.exports = {
    wrike: {
      apiBase: process.env.WRIKE_API_BASE,
      webhookSecret: process.env.WRIKE_WEBHOOK_SECRET,
      inProgressStatusId: process.env.WRIKE_IN_PROGRESS_STATUS_ID,
      completedStatusId: process.env.WRIKE_COMPLETED_STATUS_ID,
      todoStatusId: process.env.WRIKE_TODO_STATUS_ID,
      rootFolderId: process.env.WRIKE_ROOT_FOLDER_ID
    },
    webwork:{
      apiBase: process.env.WEB_WORK_API_BASE,
      apiBase2: process.env.WEB_WORK_API_BASE_2,
      apiToken: process.env.WEB_WORK_API_TOKEN,
      apiUser : process.env.WEB_WORK_USERNAME,
    }
  };