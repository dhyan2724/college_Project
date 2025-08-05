const emailUtils = require('../utils/emailUtils');

async function testUserRegistration() {
  console.log('Testing User Registration with Email...');
  
  try {
    // Simulate a new user registration
    const testUser = {
      email: 'soslabs@nuv.ac.in',
      fullName: 'Test User',
      username: 'testuser'
    };
    
    console.log('Checking email service configuration...');
    if (emailUtils.isEmailServiceConfigured()) {
      console.log('✅ Email service is configured');
      
      console.log('Sending welcome email...');
      const result = await emailUtils.sendWelcomeEmailOnRegistration(
        testUser.email, 
        testUser.fullName
      );
      
      if (result.success) {
        console.log('✅ Welcome email sent successfully');
        console.log('Message ID:', result.messageId);
      } else {
        console.log('❌ Failed to send welcome email:', result.error);
      }
    } else {
      console.log('❌ Email service is not configured');
      console.log('Please check config/email.js');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testUserRegistration(); 