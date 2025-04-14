// Configuration settings
module.exports = {
    wrike: {
      apiBase: process.env.WRIKE_API_BASE,
      webhookSecret: process.env.WRIKE_WEBHOOK_SECRET,
      inProgressStatusId: process.env.WRIKE_IN_PROGRESS_STATUS_ID,
      rootFolderId: process.env.WRIKE_ROOT_FOLDER_ID
    },
    timeDoctor: {
      company_id: process.env.TIMEDOCTOR_COMPANY_ID,
      apiBase: process.env.TIMEDOCTOR_API_BASE,
      apiBase2: process.env.TIMEDOCTOR_API_BASE_1,
      apiToken: process.env.TIMEDOCTOR_API_TOKEN
    },
    monitask:{
      apiBase: process.env.MONITASK_API_BASE,
      apiBase2: process.env.MONITASK_API_BASE_V11,
    },
    webwork:{
      apiBase: process.env.WEB_WORK_API_BASE,
      apiToken: process.env.WEB_WORK_API_TOKEN,
      apiUser : process.env.WEB_WORK_USERNAME,
    }
  };