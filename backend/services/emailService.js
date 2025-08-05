const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

// Rate limiting configuration
const rateLimits = {
  perMinute: 10,
  perHour: 100,
  perDay: 1000
};

// Rate limiting counters
const emailCounters = {
  minute: { count: 0, resetTime: Date.now() + 60000 },
  hour: { count: 0, resetTime: Date.now() + 3600000 },
  day: { count: 0, resetTime: Date.now() + 86400000 }
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: emailConfig.EMAIL_HOST,
    port: emailConfig.EMAIL_PORT,
    secure: emailConfig.EMAIL_SECURE,
    auth: {
      user: emailConfig.EMAIL_USER,
      pass: emailConfig.EMAIL_PASS
    },
    debug: emailConfig.EMAIL_DEBUG,
    logger: emailConfig.EMAIL_DEBUG
  });
};

// Check rate limits
const checkRateLimits = () => {
  const now = Date.now();
  
  // Reset counters if time has passed
  if (now > emailCounters.minute.resetTime) {
    emailCounters.minute = { count: 0, resetTime: now + 60000 };
  }
  if (now > emailCounters.hour.resetTime) {
    emailCounters.hour = { count: 0, resetTime: now + 3600000 };
  }
  if (now > emailCounters.day.resetTime) {
    emailCounters.day = { count: 0, resetTime: now + 86400000 };
  }
  
  // Check limits
  if (emailCounters.minute.count >= rateLimits.perMinute) {
    return { allowed: false, reason: 'Rate limit exceeded: too many emails per minute' };
  }
  if (emailCounters.hour.count >= rateLimits.perHour) {
    return { allowed: false, reason: 'Rate limit exceeded: too many emails per hour' };
  }
  if (emailCounters.day.count >= rateLimits.perDay) {
    return { allowed: false, reason: 'Rate limit exceeded: too many emails per day' };
  }
  
  // Increment counters
  emailCounters.minute.count++;
  emailCounters.hour.count++;
  emailCounters.day.count++;
  
  return { allowed: true };
};

// Send email function
const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    // Check rate limits
    const rateLimitCheck = checkRateLimits();
    if (!rateLimitCheck.allowed) {
      return { success: false, error: rateLimitCheck.reason };
    }
    
    // Validate email configuration
    if (!emailConfig.EMAIL_HOST || !emailConfig.EMAIL_USER || !emailConfig.EMAIL_PASS) {
      return { success: false, error: 'Email configuration is incomplete. Please check your email config file.' };
    }
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: emailConfig.EMAIL_FROM,
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  welcome: (userName, userRole = 'Student') => ({
    subject: 'Welcome to Biomedical Science Laboratory Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #007bff; margin: 0;">Welcome to Biomedical Science Laboratory Management System</h1>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
          <h2 style="color: #333; margin-top: 0;">Dear ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Welcome to the Biomedical Science Laboratory Management System! Your ${userRole.toLowerCase()} account has been successfully created.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            You can now:
          </p>
          
          <ul style="color: #666; line-height: 1.6;">
            <li>Request laboratory equipment and materials</li>
            <li>View available inventory</li>
            <li>Track your request status</li>
            <li>View your borrowing history</li>
            <li>Access laboratory guidelines</li>
          </ul>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, please contact your faculty supervisor or the laboratory administrator.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Best regards,<br>
              Biomedical Science Laboratory Team
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <img src="https://aniportalimages.s3.amazonaws.com/media/details/ANI-20250218121007.jpg" alt="Navrachana University Logo" width="200" style="border-radius: 8px;"/>
        </div>
      </div>
    `
  }),
  
  welcomeWithCredentials: (userName, username, password, rollNumber = null, role = 'Student') => ({
    subject: 'Welcome to Biomedical Science Laboratory Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #007bff; margin: 0;">Welcome to Biomedical Science Laboratory Management System</h1>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
          <h2 style="color: #333; margin-top: 0;">Dear ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Welcome to the Biomedical Science Laboratory Management System! Your ${role.toLowerCase()} account has been successfully created.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Your Login Credentials</h3>
            <p style="color: #666; margin: 5px 0;">
              <strong>Username:</strong> ${username}
            </p>
            <p style="color: #666; margin: 5px 0;">
              <strong>Password:</strong> ${password}
            </p>
            ${rollNumber ? `<p style="color: #666; margin: 5px 0;">
              <strong>Roll Number:</strong> ${rollNumber}
            </p>` : ''}
            <p style="color: #666; margin: 5px 0;">
              <strong>Role:</strong> ${role}
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            <strong>Please keep your login credentials safe and secure.</strong>
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Remember to follow all laboratory safety guidelines and return borrowed items on time.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, please contact your faculty supervisor or the laboratory administrator.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Best regards,<br>
              Biomedical Science Laboratory Team
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <img src="https://aniportalimages.s3.amazonaws.com/media/details/ANI-20250218121007.jpg" alt="Navrachana University Logo" width="200" style="border-radius: 8px;"/>
        </div>
      </div>
    `
  }),
  
  inventoryAlert: (itemName, currentQuantity, threshold) => ({
    subject: `Inventory Alert: ${itemName} is running low`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffeaa7;">
          <h1 style="color: #856404; margin: 0;">⚠️ Inventory Alert</h1>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
          <h2 style="color: #333; margin-top: 0;">Low Stock Alert</h2>
          
          <p style="color: #666; line-height: 1.6;">
            The following item is running low on stock:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 10px 0;">${itemName}</h3>
            <p style="color: #666; margin: 5px 0;">
              <strong>Current Quantity:</strong> ${currentQuantity}
            </p>
            <p style="color: #666; margin: 5px 0;">
              <strong>Threshold:</strong> ${threshold}
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Please take action to replenish the stock as soon as possible.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated alert from the Lab Management System.
            </p>
          </div>
        </div>
      </div>
    `
  }),
  
  requestStatus: (userName, requestType, status, itemName) => ({
    subject: `Request Status Update: ${requestType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #c3e6cb;">
          <h1 style="color: #155724; margin: 0;">📋 Request Status Update</h1>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Your request status has been updated:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Request Details</h3>
            <p style="color: #666; margin: 5px 0;">
              <strong>Type:</strong> ${requestType}
            </p>
            <p style="color: #666; margin: 5px 0;">
              <strong>Item:</strong> ${itemName}
            </p>
            <p style="color: #666; margin: 5px 0;">
              <strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${status}</span>
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            You can check the full details of your request in the Lab Management System.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated notification from the Lab Management System.
            </p>
          </div>
        </div>
      </div>
    `
  }),
  
  passwordReset: (resetToken) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #bee5eb;">
          <h1 style="color: #0c5460; margin: 0;">🔐 Password Reset</h1>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
          
          <p style="color: #666; line-height: 1.6;">
            You have requested to reset your password for the Lab Management System.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Please use the following token to reset your password:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <code style="background-color: #e9ecef; padding: 10px; border-radius: 3px; font-size: 16px; font-weight: bold; color: #495057;">
              ${resetToken}
            </code>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If you did not request this password reset, please ignore this email.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated message from the Lab Management System.
            </p>
          </div>
        </div>
      </div>
    `
  }),
  
  customNotification: (subject, message) => ({
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #007bff; margin: 0;">Lab Management System</h1>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
          <h2 style="color: #333; margin-top: 0;">${subject}</h2>
          
          <div style="color: #666; line-height: 1.6;">
            ${message}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              This is an automated message from the Lab Management System.
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // New template for faculty request notifications
  facultyRequestNotification: (facultyName, studentName, studentRollNo, items, purpose, desiredIssueTime, desiredReturnTime, notes, portalLink) => ({
    subject: `New Laboratory Request from ${studentName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #007bff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">🔬 New Laboratory Request</h1>
        </div>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
          <h2 style="color: #333; margin-top: 0;">Dear ${facultyName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            A new laboratory request has been submitted by a student that requires your approval.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="color: #333; margin: 0 0 10px 0;">Student Information</h3>
            <p style="color: #666; margin: 5px 0;">
              <strong>Name:</strong> ${studentName}
            </p>
            <p style="color: #666; margin: 5px 0;">
              <strong>Roll Number:</strong> ${studentRollNo}
            </p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin: 0 0 10px 0;">Request Details</h3>
            <p style="color: #666; margin: 5px 0;">
              <strong>Purpose:</strong> ${purpose}
            </p>
            ${desiredIssueTime ? `<p style="color: #666; margin: 5px 0;">
              <strong>Desired Issue Time:</strong> ${new Date(desiredIssueTime).toLocaleString()}
            </p>` : ''}
            ${desiredReturnTime ? `<p style="color: #666; margin: 5px 0;">
              <strong>Desired Return Time:</strong> ${new Date(desiredReturnTime).toLocaleString()}
            </p>` : ''}
            ${notes ? `<p style="color: #666; margin: 5px 0;">
              <strong>Notes:</strong> ${notes}
            </p>` : ''}
          </div>
          
          <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h3 style="color: #0c5460; margin: 0 0 10px 0;">Requested Items</h3>
            ${items.map(item => `
              <div style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px;">
                <p style="color: #666; margin: 5px 0;">
                  <strong>Item:</strong> ${item.name}
                </p>
                <p style="color: #666; margin: 5px 0;">
                  <strong>Type:</strong> ${item.itemType}
                </p>
                ${item.quantity ? `<p style="color: #666; margin: 5px 0;">
                  <strong>Quantity:</strong> ${item.quantity}
                </p>` : ''}
                ${item.totalWeightRequested ? `<p style="color: #666; margin: 5px 0;">
                  <strong>Weight Requested:</strong> ${item.totalWeightRequested} g
                </p>` : ''}
              </div>
            `).join('')}
          </div>
          
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #155724; margin: 0 0 10px 0;">Action Required</h3>
            <p style="color: #666; line-height: 1.6;">
              Please review this request and take appropriate action through the laboratory management portal.
            </p>
            <a href="${portalLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
              📋 Review Request in Portal
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            <strong>Note:</strong> This request is currently pending your approval. Please respond promptly to ensure efficient laboratory operations.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Best regards,<br>
              Biomedical Science Laboratory Management System
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <img src="https://aniportalimages.s3.amazonaws.com/media/details/ANI-20250218121007.jpg" alt="Navrachana University Logo" width="200" style="border-radius: 8px;"/>
        </div>
      </div>
    `
  })
};

  // Public API functions
  const emailService = {
    // Send welcome email
    sendWelcomeEmail: async (userEmail, userName) => {
      const template = emailTemplates.welcome(userName);
      return await sendEmail(userEmail, template.subject, template.html);
    },
    
    // Send welcome email with credentials
    sendWelcomeEmailWithCredentials: async (userEmail, userName, username, password, rollNumber = null, role = 'Student') => {
      const template = emailTemplates.welcomeWithCredentials(userName, username, password, rollNumber, role);
      return await sendEmail(userEmail, template.subject, template.html);
    },
  
  // Send inventory alert email
  sendInventoryAlertEmail: async (userEmail, itemName, currentQuantity, threshold) => {
    const template = emailTemplates.inventoryAlert(itemName, currentQuantity, threshold);
    return await sendEmail(userEmail, template.subject, template.html);
  },
  
  // Send request status email
  sendRequestStatusEmail: async (userEmail, userName, requestType, status, itemName) => {
    const template = emailTemplates.requestStatus(userName, requestType, status, itemName);
    return await sendEmail(userEmail, template.subject, template.html);
  },
  
  // Send password reset email
  sendPasswordResetEmail: async (userEmail, resetToken) => {
    const template = emailTemplates.passwordReset(resetToken);
    return await sendEmail(userEmail, template.subject, template.html);
  },
  
  // Send custom notification email
  sendCustomNotificationEmail: async (userEmail, subject, message) => {
    const template = emailTemplates.customNotification(subject, message);
    return await sendEmail(userEmail, template.subject, template.html);
  },

  // Send faculty request notification email
  sendFacultyRequestNotification: async (facultyEmail, facultyName, studentName, studentRollNo, items, purpose, desiredIssueTime, desiredReturnTime, notes, portalLink) => {
    const template = emailTemplates.facultyRequestNotification(facultyName, studentName, studentRollNo, items, purpose, desiredIssueTime, desiredReturnTime, notes, portalLink);
    return await sendEmail(facultyEmail, template.subject, template.html);
  },
  
  // Get rate limit status
  getRateLimitStatus: () => {
    const now = Date.now();
    return {
      minute: {
        count: emailCounters.minute.count,
        limit: rateLimits.perMinute,
        resetTime: emailCounters.minute.resetTime,
        remaining: Math.max(0, rateLimits.perMinute - emailCounters.minute.count)
      },
      hour: {
        count: emailCounters.hour.count,
        limit: rateLimits.perHour,
        resetTime: emailCounters.hour.resetTime,
        remaining: Math.max(0, rateLimits.perHour - emailCounters.hour.count)
      },
      day: {
        count: emailCounters.day.count,
        limit: rateLimits.perDay,
        resetTime: emailCounters.day.resetTime,
        remaining: Math.max(0, rateLimits.perDay - emailCounters.day.count)
      }
    };
  },
  
  // Check if email service is configured
  isConfigured: () => {
    return !!(emailConfig.EMAIL_HOST && emailConfig.EMAIL_USER && emailConfig.EMAIL_PASS);
  }
};

module.exports = emailService; 