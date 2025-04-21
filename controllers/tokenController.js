const tokenService = require('../services/tokenService');

// Get Wrike token
exports.getWrikeToken = async (req, res) => {
  try {
    const token = tokenService.getWrikeToken();
    
    res.status(200).json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Error fetching Wrike token:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get WebWork token
exports.getWebworkToken = async (req, res) => {
  try {
    const token = tokenService.getWebworkToken();
    
    res.status(200).json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Error fetching WebWork token:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get WebWork token expiry days
exports.getWebworkTokenExpiry = async (req, res) => {
  try {
    const expiryInfo = await tokenService.getWebworkTokenExpiryDays();
    
    res.status(200).json({
      success: true,
      data: expiryInfo
    });
  } catch (error) {
    console.error('Error fetching WebWork token expiry:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update Wrike token
exports.updateWrikeToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }
    
    const updatedToken = await tokenService.updateWrikeToken(token);
    
    res.status(200).json({
      success: true,
      data: updatedToken
    });
  } catch (error) {
    console.error('Error updating Wrike token:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update WebWork token
exports.updateWebworkToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token ) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }
    
    const updatedToken = await tokenService.updateWebworkToken(token);
    
    res.status(200).json({
      success: true,
      data: updatedToken
    });
  } catch (error) {
    console.error('Error updating WebWork token:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};