const emailUtils = require('../utils/emailUtils');

async function testFacultyNotification() {
  console.log('Testing Faculty Request Notification Email...');
  
  try {
    // Mock data for testing
    const facultyEmail = 'soslabs@nuv.ac.in'; // Replace with actual faculty email
    const facultyName = 'Dr. Jeel Parmar';
    const studentName = 'Heer Patel';
    const studentRollNo = '22000901';
    
    const items = [
      {
        name: 'Sodium Hydroxide',
        itemType: 'Chemical',
        quantity: null,
        totalWeightRequested: 50
      },
      {
        name: 'Beaker 100ml',
        itemType: 'Glassware',
        quantity: 2,
        totalWeightRequested: null
      },
      {
        name: 'Microscope',
        itemType: 'Instrument',
        quantity: 1,
        totalWeightRequested: null
      }
    ];
    
    const purpose = 'Biochemistry Lab Experiment - Protein Analysis';
    const desiredIssueTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const desiredReturnTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    const notes = 'Need for practical examination. Will handle with care.';
    const portalLink = 'http://localhost:3000/teacher?requestId=test123';
    
    console.log('\nSending test faculty notification email...');
    const result = await emailUtils.sendFacultyRequestNotification(
      facultyEmail,
      facultyName,
      studentName,
      studentRollNo,
      items,
      purpose,
      desiredIssueTime,
      desiredReturnTime,
      notes,
      portalLink
    );
    
    if (result.success) {
      console.log('✅ Faculty notification email sent successfully');
      console.log('Message ID:', result.messageId);
      console.log('\n📧 Check your inbox at', facultyEmail, 'for the test email');
    } else {
      console.log('❌ Failed to send faculty notification email:', result.error);
    }
    
    console.log('\n🎉 Faculty notification email testing completed!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testFacultyNotification(); 