const Token = require('../models/token');
const { logDatabaseApiCall } = require('./apiLoggerService');

// Global token storage
let globalTokens = {
  wrike: null,
  webwork:null
};

// Initialize tokens from database
const initializeTokens = async () => {
  try {
    // logDatabaseApiCall();
    const tokens = await Token.find();
    console.log('Tokens from database:', tokens); // Add this line for debugging purposes
    tokens.forEach(token => {
      if (token.name === 'wrike') {
        globalTokens.wrike = token.token;
      } else if (token.name === 'webwork') {
        globalTokens.webwork= token.token;
      }
    });
    
    console.log('Tokens initialized from database');
    return globalTokens;

  } catch (error) {
    console.error('Error initializing tokens:', error.message);
    throw new Error('Failed to initialize tokens');
  }
};

// Get Wrike token
const getWrikeToken = () => {
  return globalTokens.wrike;
};

// Get WebWork token and username
const getWebworkToken = () => {
  return globalTokens.webwork;
};

// Get WebWork token expiry days remaining
const getWebworkTokenExpiryDays = async () => {
  try {
    logDatabaseApiCall();
    const webworkToken = await Token.findOne({ name: 'webwork' });
    
    if (!webworkToken) {
      throw new Error('WebWork token not found');
    }
    
    const updatedAt = new Date(webworkToken.updatedAt);
    const currentDate = new Date();
    
    // WebWork tokens expire after 30 days
    const expiryDate = new Date(updatedAt);
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Calculate days remaining
    const timeDiff = expiryDate.getTime() - currentDate.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return {
      updatedAt: webworkToken.updatedAt,
      expiryDate: expiryDate,
      daysRemaining: daysRemaining
    };
  } catch (error) {
    console.error('Error calculating WebWork token expiry:', error.message);
    throw new Error('Failed to calculate WebWork token expiry');
  }
};

// Update Wrike token
const updateWrikeToken = async (token) => {
  try {
    logDatabaseApiCall();
    const updatedToken = await Token.findOneAndUpdate(
      { name: 'wrike' },
      { 
        token,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    // Update global token
    globalTokens.wrike = token;
    return updatedToken;

  } catch (error) {
    console.error('Error updating Wrike token:', error.message);
    throw new Error('Failed to update Wrike token');
  }
};

// Update WebWork token
const updateWebworkToken = async (token) => {
  try {
    logDatabaseApiCall();
    const updatedToken = await Token.findOneAndUpdate(
      { name: 'webwork' },
      { 
        token,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    // Update global token
    globalTokens.webwork= token;
    return updatedToken;
  } catch (error) {
    console.error('Error updating WebWork token:', error.message);
    throw new Error('Failed to update WebWork token');
  }
};

module.exports = {
  initializeTokens,
  getWrikeToken,
  getWebworkToken,
  getWebworkTokenExpiryDays,
  updateWrikeToken,
  updateWebworkToken,
};