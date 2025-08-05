const emailService = require('../services/emailService.js');

async function testEmailService() {
  console.log('Testing Email Service...');
  console.log('Email Configuration:');
  console.log('Host: smtp-mail.outlook.com');
  console.log('User: soslabs@nuv.ac.in');
  console.log('Port: 587');
  console.log('Secure: false');
  
  try {
    // Test 1: Send a simple test email
    console.log('\n1. Testing simple email...');
    const testResult = await emailService.sendCustomNotificationEmail(
      'soslabs@nuv.ac.in', // Send to yourself for testing
      'Test Email from Lab Management System',
      'This is a test email to verify that the SMTP configuration is working correctly.'
    );
    
    if (testResult.success) {
      console.log('✅ Simple email test passed!');
    } else {
      console.log('❌ Simple email test failed:', testResult.error);
    }
    
    // Test 2: Send welcome email
    console.log('\n2. Testing welcome email...');
    const welcomeResult = await emailService.sendWelcomeEmail(
      'soslabs@nuv.ac.in',
      'Test User'
    );
    
    if (welcomeResult.success) {
      console.log('✅ Welcome email test passed!');
    } else {
      console.log('❌ Welcome email test failed:', welcomeResult.error);
    }
    
    // Test 3: Send inventory alert email
    console.log('\n3. Testing inventory alert email...');
    const alertResult = await emailService.sendInventoryAlertEmail(
      'soslabs@nuv.ac.in',
      'Test Chemical',
      5,
      10
    );
    
    if (alertResult.success) {
      console.log('✅ Inventory alert email test passed!');
    } else {
      console.log('❌ Inventory alert email test failed:', alertResult.error);
    }
    
    // Test 4: Send request status email
    console.log('\n4. Testing request status email...');
    const statusResult = await emailService.sendRequestStatusEmail(
      'soslabs@nuv.ac.in',
      'Test User',
      'Chemical Request',
      'Approved',
      'Test Chemical'
    );
    
    if (statusResult.success) {
      console.log('✅ Request status email test passed!');
    } else {
      console.log('❌ Request status email test failed:', statusResult.error);
    }
    
    console.log('\n🎉 Email service testing completed!');
    console.log('Check your inbox at soslabs@nuv.ac.in for the test emails.');
    
  } catch (error) {
    console.error('❌ Error during email testing:', error);
  }
}

// Run the test
testEmailService(); 