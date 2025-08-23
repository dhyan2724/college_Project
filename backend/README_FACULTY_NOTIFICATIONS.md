# Faculty Email Notifications for Student Requests

## Overview
This feature automatically sends email notifications to faculty members when students submit laboratory equipment/material requests. The email includes all request details and a direct link to the faculty portal for easy approval/rejection.

## How It Works

### 1. Student Submits Request
When a student submits a request through the student dashboard:
- Request is saved to the database
- Email notification is automatically sent to the selected faculty member
- Activity log is created for tracking

### 2. Email Content
The notification email includes:
- **Student Information**: Name, Roll Number
- **Request Details**: Purpose, desired issue/return times, notes
- **Requested Items**: Complete list with quantities and weights
- **Portal Link**: Direct link to review and approve/reject the request

### 3. Email Template Features
- Professional design with university branding
- Color-coded sections for easy reading
- Mobile-responsive layout
- Direct action button to access the portal

## Email Template Structure

```
Subject: New Laboratory Request from [Student Name]

Content Sections:
├── Header with university logo
├── Student Information
│   ├── Student Name
│   └── Roll Number
├── Request Details
│   ├── Purpose
│   ├── Desired Issue Time
│   ├── Desired Return Time
│   └── Notes
├── Requested Items
│   ├── Item Name
│   ├── Item Type
│   ├── Quantity (if applicable)
│   └── Weight Requested (for chemicals)
└── Action Required
    ├── Portal Link Button
    └── Instructions
```

## Configuration

### Email Settings
The email service is configured in `backend/config/email.js`:
```javascript
module.exports = {
  EMAIL_HOST: 'smtp-mail.outlook.com',
  EMAIL_USER: 'soslabs@nuv.ac.in',
  EMAIL_PASS: 'SOS2207@2025',
  EMAIL_PORT: 587,
  EMAIL_SECURE: false,
  EMAIL_FROM: 'soslabs@nuv.ac.in',
  EMAIL_DEBUG: false
};
```

### Portal Link Configuration
The portal link in the email is generated as:
```
http://localhost:3000/teacher?requestId={requestId}
```

**For production, update the URL in `backend/routes/pendingrequests.js` line 108:**
```javascript
const portalLink = `https://your-domain.com/teacher?requestId=${newPendingRequest.id}`;
```

## Testing

### Test the Email Functionality
Run the test script to verify email sending:
```bash
cd backend
node scripts/testFacultyNotification.js
```

### Test with Real Data
1. Create a student account
2. Create a faculty account
3. Submit a request as a student
4. Check faculty's email for notification

## Error Handling

The system includes robust error handling:
- Email failures don't prevent request submission
- Detailed logging for troubleshooting
- Graceful fallback if email service is unavailable

## Logs

Check the console for email-related logs:
```
✅ Faculty notification email sent successfully
❌ Failed to send faculty notification email: [error details]
📧 Email service not configured. Skipping faculty notification email.
```

## Files Modified

1. **`backend/services/emailService.js`**
   - Added `facultyRequestNotification` template
   - Added `sendFacultyRequestNotification` function

2. **`backend/utils/emailUtils.js`**
   - Added `sendFacultyRequestNotification` utility function

3. **`backend/routes/pendingrequests.js`**
   - Added email notification logic to POST route
   - Added model imports for item details

4. **`backend/scripts/testFacultyNotification.js`**
   - Created test script for email functionality

## Security Considerations

- Email credentials are stored in environment variables
- Faculty emails are validated before sending
- Request data is sanitized before email generation
- No sensitive information is logged

## Troubleshooting

### Email Not Sending
1. Check email configuration in `config/email.js`
2. Verify faculty has valid email address
3. Check console logs for error messages
4. Test with `testFacultyNotification.js` script

### Portal Link Issues
1. Update the portal URL in `pendingrequests.js`
2. Ensure faculty can access the teacher dashboard
3. Verify request ID is properly passed in URL

### Template Issues
1. Check HTML template in `emailService.js`
2. Verify all variables are properly escaped
3. Test with different item types and quantities 