const Setting = require('../models/setting');
const { logDatabaseApiCall } = require('../services/apiLoggerService');

// Constants
const BATCH_SIZE_KEY = "batch_size";
const DEFAULT_BATCH_SIZE = 10; // Default batch size if not set

// Get batch size
exports.getBatchSize = async (req, res) => {
  try {
    logDatabaseApiCall();
    const setting = await Setting.findOne({ key: BATCH_SIZE_KEY });
    const batchSize = setting ? parseInt(setting.value, 10) : DEFAULT_BATCH_SIZE;
    
    res.status(200).json({
      success: true,
      data: { batchSize }
    });
  } catch (error) {
    console.error('Error fetching batch size:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update batch size
exports.updateBatchSize = async (req, res) => {
  try {
    const { batchSize } = req.body;
    
    // Validate input
    if (!batchSize || isNaN(parseInt(batchSize, 10)) || parseInt(batchSize, 10) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid positive batch size'
      });
    }
    
    // Update or create the setting
    logDatabaseApiCall();
    const updatedSetting = await Setting.findOneAndUpdate(
      { key: BATCH_SIZE_KEY },
      { value: batchSize.toString() },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      success: true,
      data: { 
        key: updatedSetting.key,
        batchSize: parseInt(updatedSetting.value, 10)
      }
    });
  } catch (error) {
    console.error('Error updating batch size:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};