const User = require('../models/user_wrike_webwork');
const { logDatabaseApiCall } = require('../services/apiLoggerService');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    logDatabaseApiCall();
    const users = await User.find();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Add a new user
exports.addUser = async (req, res) => {
  try {
    const { email, wrikeId, webworkId } = req.body;
    
    // Validate required fields
    if (!email || !wrikeId || !webworkId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, wrikeId, and webworkId'
      });
    }
    
    // Check if user already exists
    logDatabaseApiCall();
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { wrikeId }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email or Wrike ID already exists'
      });
    }
    
    // Create new user
    logDatabaseApiCall();
    const user = await User.create({
      email,
      wrikeId,
      webworkId: parseInt(webworkId)
    });
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error adding user:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    logDatabaseApiCall();
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, wrikeId, webworkId } = req.body;
    
    // Validate required fields
    if (!email && !wrikeId && !webworkId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one field to update'
      });
    }
    
    // Find and update user
    logDatabaseApiCall();
    const user = await User.findByIdAndUpdate(
      id,
      { 
        ...(email && { email }),
        ...(wrikeId && { wrikeId }),
        ...(webworkId && { webworkId: parseInt(webworkId) })
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};