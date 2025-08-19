const express = require('express');
const cors = require('cors');
const { testConnection, initializeDatabase } = require('./config/database');
const plasticwaresRouter = require('./routes/plasticwares');

// Create a minimal test server
const app = express();
app.use(cors());
app.use(express.json());

// Test the plasticwares route
app.use('/api/plasticwares', plasticwaresRouter);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test server is running' });
});

const port = 5001; // Use different port to avoid conflict

const initializeTestApp = async () => {
  try {
    console.log('Testing database connection...');
    await testConnection();
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    // Start test server
    app.listen(port, () => {
      console.log(`✅ Test server running on port ${port}`);
      console.log(`✅ Test endpoint: http://localhost:${port}/test`);
      console.log(`✅ Plasticwares endpoint: http://localhost:${port}/api/plasticwares`);
      console.log('\nNow test these URLs in your browser:');
      console.log(`1. http://localhost:${port}/test`);
      console.log(`2. http://localhost:${port}/api/plasticwares`);
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize test app:', error);
  }
};

initializeTestApp();
