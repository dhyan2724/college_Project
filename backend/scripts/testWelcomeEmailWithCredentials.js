const emailUtils = require('../utils/emailUtils');

async function testWelcomeEmailWithCredentials() {
  console.log('Testing Welcome Email with Credentials...');
  
  try {
    // Test 1: Student account
    console.log('\n1. Testing Student account...');
    const studentResult = await emailUtils.sendWelcomeEmailWithCredentials(
      'soslabs@nuv.ac.in',
      'Heer Patel',
      'heer',
      'heer@123',
      '22000901',
      'Student'
    );
    
    if (studentResult.success) {
      console.log('✅ Student welcome email sent successfully');
      console.log('Message ID:', studentResult.messageId);
    } else {
      console.log('❌ Failed to send student welcome email:', studentResult.error);
    }
    
    // Test 2: Faculty account
    console.log('\n2. Testing Faculty account...');
    const facultyResult = await emailUtils.sendWelcomeEmailWithCredentials(
      'soslabs@nuv.ac.in',
      'Jeel Parmar',
      'jeel parmar',
      'jeel@123',
      null, // No roll number for faculty
      'Faculty Member'
    );
    
    if (facultyResult.success) {
      console.log('✅ Faculty welcome email sent successfully');
      console.log('Message ID:', facultyResult.messageId);
    } else {
      console.log('❌ Failed to send faculty welcome email:', facultyResult.error);
    }
    
    console.log('\n🎉 Welcome email with credentials testing completed!');
    console.log('Check your inbox at soslabs@nuv.ac.in for the test emails.');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testWelcomeEmailWithCredentials(); 