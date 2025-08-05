# Email Service Setup and Usage

This document explains how to set up and use the email service for the Lab Management System.

## Setup

### 1. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Email Configuration
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_USER=soslabs@nuv.ac.in
EMAIL_PASS=SOS2207@2025
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=soslabs@nuv.ac.in
```

### 2. Install Dependencies

Make sure you have the required dependencies installed:

```bash
npm install nodemailer dotenv
```

## Testing the Email Service

Run the test script to verify that the email service is working:

```bash
cd backend
node scripts/testEmailService.js
```

This will send test emails to `soslabs@nuv.ac.in` to verify the configuration.

## Usage

### Basic Email Service

The email service provides several functions for different types of emails:

```javascript
const emailService = require('./services/emailService');

// Send a custom notification email
await emailService.sendCustomNotificationEmail(
  'recipient@example.com',
  'Subject',
  'Message content'
);

// Send a welcome email
await emailService.sendWelcomeEmail(
  'user@example.com',
  'User Name'
);

// Send inventory alert email
await emailService.sendInventoryAlertEmail(
  'admin@example.com',
  'Chemical Name',
  currentQuantity,
  threshold
);

// Send request status email
await emailService.sendRequestStatusEmail(
  'user@example.com',
  'User Name',
  'Request Type',
  'Status',
  'Item Name'
);

// Send password reset email
await emailService.sendPasswordResetEmail(
  'user@example.com',
  resetToken
);
```

### Email Utils

Use the utility functions for easier integration:

```javascript
const emailUtils = require('./utils/emailUtils');

// Check if email service is configured
if (emailUtils.isEmailServiceConfigured()) {
  // Send emails
  await emailUtils.sendWelcomeEmailOnRegistration('user@example.com', 'User Name');
}

// Send bulk emails
const emailList = ['user1@example.com', 'user2@example.com'];
const results = await emailUtils.sendBulkEmails(emailList, 'Subject', 'Message');
```

## Integration Examples

### 1. User Registration

In your user registration route:

```javascript
const emailUtils = require('../utils/emailUtils');

// After successful user registration
if (emailUtils.isEmailServiceConfigured()) {
  await emailUtils.sendWelcomeEmailOnRegistration(user.email, user.name);
}
```

### 2. Inventory Alerts

In your inventory management:

```javascript
const emailUtils = require('../utils/emailUtils');

// When inventory is low
if (currentQuantity <= threshold && emailUtils.isEmailServiceConfigured()) {
  await emailUtils.sendInventoryAlertEmail(
    adminEmail,
    itemName,
    currentQuantity,
    threshold
  );
}
```

### 3. Request Status Updates

In your request processing:

```javascript
const emailUtils = require('../utils/emailUtils');

// When request status changes
if (emailUtils.isEmailServiceConfigured()) {
  await emailUtils.sendRequestStatusEmail(
    userEmail,
    userName,
    requestType,
    newStatus,
    itemName
  );
}
```

## Email Templates

The email service includes pre-built templates for:

1. **Welcome Email**: Sent when users register
2. **Inventory Alert**: Sent when inventory is low
3. **Request Status**: Sent when request status changes
4. **Password Reset**: Sent for password reset requests
5. **Custom Notification**: For general notifications

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify your email credentials in `.env`
   - Check if 2FA is enabled (you may need an app password)
   - Ensure the email account allows "less secure apps"

2. **Connection Timeout**
   - Check your internet connection
   - Verify the SMTP host and port
   - Try different ports (587, 465, 25)

3. **Email Not Received**
   - Check spam/junk folder
   - Verify recipient email address
   - Check sender email configuration

### Debug Mode

Enable debug mode by setting:

```env
EMAIL_DEBUG=true
```

This will show detailed SMTP communication logs.

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use environment variables** for sensitive data
3. **Regularly rotate passwords** for email accounts
4. **Monitor email sending** to prevent abuse

## Rate Limiting

The email service includes basic rate limiting to prevent abuse:

- Maximum 10 emails per minute
- Maximum 100 emails per hour
- Maximum 1000 emails per day

These limits can be adjusted in the email service configuration.

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify your `.env` configuration
3. Test with the provided test script
4. Check your email provider's SMTP settings 