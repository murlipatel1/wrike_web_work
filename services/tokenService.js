const Token = require('../models/token');
// const { globalTokens } = require('../utils/globals');
const {logDatabaseApiCall} = require('./apiLoggerService');

// Global token storage
let globalTokens = {
  wrike: null,
  webwork:null
};

// Initialize tokens from database
const initializeTokens = async () => {
  try {
    // logDatabaseApiCall();
    // Reset global tokens
    globalTokens = { wrike: null, webwork: null };

    // Get all tokens in one query
    const tokens = await Token.find({
      name: { $in: ['wrike', 'webwork'] }
    });

    // Validate both tokens exist
    const foundNames = new Set(tokens.map(t => t.name));
    const missingTokens = ['wrike', 'webwork'].filter(name => !foundNames.has(name));

    if (missingTokens.length > 0) {
      throw new Error(`Missing tokens in database: ${missingTokens.join(', ')}`);
    }

    // Update global tokens
    tokens.forEach(token => {
      globalTokens[token.name] = token.token;
    });

    console.log('Tokens initialized from database');
    return globalTokens;

  } catch (error) {
    console.error('Error initializing tokens:', error.message);
    throw new Error(`Token initialization failed: ${error.message}`);
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
    // logDatabaseApiCall();
    const webworkToken = await Token.findOne({ name: 'webwork' });
    
    if (!webworkToken) {
      throw new Error('WebWork token not found');
    }
    console.log('WebWork Token:', webworkToken);
    const updatedAt = new Date(webworkToken.updatedAt);
    console.log('Updated At:', updatedAt);
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
    // logDatabaseApiCall();
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
    // logDatabaseApiCall();
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