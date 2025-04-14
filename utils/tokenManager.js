const Token = require('../models/token');
const axios = require('axios');
// Global token variables
let accessToken = null;
let refreshToken = null;

// Load token from DB on server start
const loadTokenFromDB = async () => {
  try {
    const tokenData = await Token.findOne();

    if (!tokenData || !tokenData.refreshToken) {
        console.error('No refresh token found in DB. Cannot proceed.');
        return;
    }
    refreshToken = tokenData.refreshToken;
    const response = await axios.post('https://app.monitask.com/identity/connect/token', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken, 
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(`${process.env.MONITASK_CLIENT_ID}:${process.env.MONITASK_CLIENT_SECRET}`).toString('base64'),
    },
    });
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;

    console.log('Access token and refresh token initialized.');
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    await Token.updateOne({},{ refreshToken}, { upsert: true });
    console.log('Tokens initialized and stored in memory & DB.');
    return;
} catch (error) {
    console.error('Error during token initialization:', error.response?.data || error.message);
}
};


function getAccessToken() {
  if (!accessToken) {
    throw new Error('Access token is not available. Please check the initialization process.');
  }
  return accessToken;
}

module.exports = { getAccessToken , loadTokenFromDB };