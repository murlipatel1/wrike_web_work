/**
 * Helper functions for the application
 */

/**
 * Format time in seconds to hours
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time in hours
 */
exports.formatTimeToHours = (seconds) => {
    return (seconds / 3600).toFixed(2);
  };
  
  /**
   * Log error details
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  exports.logError = (error, context) => {
    console.error(`Error in ${context}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  };