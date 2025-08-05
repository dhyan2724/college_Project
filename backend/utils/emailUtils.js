const emailService = require('../services/emailService');
const emailConfig = require('../config/email');

// Utility function to send welcome email when user registers
const sendWelcomeEmailOnRegistration = async (userEmail, userName) => {
  try {
    const result = await emailService.sendWelcomeEmail(userEmail, userName);
    if (result.success) {
      console.log(`Welcome email sent to ${userEmail}`);
    } else {
      console.error(`Failed to send welcome email to ${userEmail}:`, result.error);
    }
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Utility function to send welcome email with credentials
const sendWelcomeEmailWithCredentials = async (userEmail, userName, username, password, rollNumber = null, role = 'Student') => {
  try {
    const result = await emailService.sendWelcomeEmailWithCredentials(userEmail, userName, username, password, rollNumber, role);
    if (result.success) {
      console.log(`Welcome email with credentials sent to ${userEmail}`);
    } else {
      console.error(`Failed to send welcome email with credentials to ${userEmail}:`, result.error);
    }
    return result;
  } catch (error) {
    console.error('Error sending welcome email with credentials:', error);
    return { success: false, error: error.message };
  }
};

// Utility function to send inventory alert emails
const sendInventoryAlertEmail = async (userEmail, itemName, currentQuantity, threshold) => {
  try {
    const result = await emailService.sendInventoryAlertEmail(userEmail, itemName, currentQuantity, threshold);
    if (result.success) {
      console.log(`Inventory alert email sent to ${userEmail} for ${itemName}`);
    } else {
      console.error(`Failed to send inventory alert email to ${userEmail}:`, result.error);
    }
    return result;
  } catch (error) {
    console.error('Error sending inventory alert email:', error);
    return { success: false, error: error.message };
  }
};

// Utility function to send request status emails
const sendRequestStatusEmail = async (userEmail, userName, requestType, status, itemName) => {
  try {
    const result = await emailService.sendRequestStatusEmail(userEmail, userName, requestType, status, itemName);
    if (result.success) {
      console.log(`Request status email sent to ${userEmail} for ${requestType}`);
    } else {
      console.error(`Failed to send request status email to ${userEmail}:`, result.error);
    }
    return result;
  } catch (error) {
    console.error('Error sending request status email:', error);
    return { success: false, error: error.message };
  }
};

// Utility function to send password reset emails
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const result = await emailService.sendPasswordResetEmail(userEmail, resetToken);
    if (result.success) {
      console.log(`Password reset email sent to ${userEmail}`);
    } else {
      console.error(`Failed to send password reset email to ${userEmail}:`, result.error);
    }
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Utility function to send custom notification emails
const sendCustomNotificationEmail = async (userEmail, subject, message) => {
  try {
    const result = await emailService.sendCustomNotificationEmail(userEmail, subject, message);
    if (result.success) {
      console.log(`Custom notification email sent to ${userEmail}`);
    } else {
      console.error(`Failed to send custom notification email to ${userEmail}:`, result.error);
    }
    return result;
  } catch (error) {
    console.error('Error sending custom notification email:', error);
    return { success: false, error: error.message };
  }
};

// Utility function to send faculty request notification emails
const sendFacultyRequestNotification = async (facultyEmail, facultyName, studentName, studentRollNo, items, purpose, desiredIssueTime, desiredReturnTime, notes, portalLink) => {
  try {
    const result = await emailService.sendFacultyRequestNotification(facultyEmail, facultyName, studentName, studentRollNo, items, purpose, desiredIssueTime, desiredReturnTime, notes, portalLink);
    if (result.success) {
      console.log(`Faculty request notification email sent to ${facultyEmail}`);
    } else {
      console.error(`Failed to send faculty request notification email to ${facultyEmail}:`, result.error);
    }
    return result;
  } catch (error) {
    console.error('Error sending faculty request notification email:', error);
    return { success: false, error: error.message };
  }
};

// Utility function to send bulk emails
const sendBulkEmails = async (emailList, subject, message) => {
  const results = [];
  
  for (const userEmail of emailList) {
    try {
      const result = await emailService.sendCustomNotificationEmail(userEmail, subject, message);
      results.push({ email: userEmail, success: result.success, error: result.error });
    } catch (error) {
      results.push({ email: userEmail, success: false, error: error.message });
    }
  }
  
  return results;
};

// Utility function to check if email service is configured
const isEmailServiceConfigured = () => {
  return !!(emailConfig.EMAIL_HOST && emailConfig.EMAIL_USER && emailConfig.EMAIL_PASS);
};

module.exports = {
  sendWelcomeEmailOnRegistration,
  sendWelcomeEmailWithCredentials,
  sendInventoryAlertEmail,
  sendRequestStatusEmail,
  sendPasswordResetEmail,
  sendCustomNotificationEmail,
  sendFacultyRequestNotification,
  sendBulkEmails,
  isEmailServiceConfigured
}; 