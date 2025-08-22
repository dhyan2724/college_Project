// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testConnection, initializeDatabase } = require('./config/database');
const usersRouter = require('./routes/users');
const chemicalsRouter = require('./routes/chemicals');
const glasswaresRouter = require('./routes/glasswares');
const plasticwaresRouter = require('./routes/plasticwares');
const instrumentsRouter = require('./routes/instruments');
const issuedItemsRouter = require('./routes/issueditems');
const pendingRequestsRouter = require('./routes/pendingrequests');
const labRegistersRouter = require('./routes/labregisters');
const activityLogsRouter = require('./routes/activitylogs');
const miscellaneousRouter = require('./routes/miscellaneous');
const faqRouter = require('./routes/faq');
const masterAdminRouter = require('./routes/masterAdmin');
const specimensRouter = require('./routes/specimens');
const slidesRouter = require('./routes/slides');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Initialize MySQL database
const initializeApp = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database schema
    await initializeDatabase();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/users', usersRouter);
app.use('/api/chemicals', chemicalsRouter);
app.use('/api/glasswares', glasswaresRouter);
app.use('/api/plasticwares', plasticwaresRouter);
app.use('/api/instruments', instrumentsRouter);
app.use('/api/issueditems', issuedItemsRouter);
app.use('/api/pendingrequests', pendingRequestsRouter);
app.use('/api/labregisters', labRegistersRouter);
app.use('/api/activitylogs', activityLogsRouter);
app.use('/api/miscellaneous', miscellaneousRouter);
app.use('/api/faq', faqRouter);
app.use('/api/master-admin', masterAdminRouter);
app.use('/api/specimens', specimensRouter);
app.use('/api/slides', slidesRouter);

// Start server after database initialization
initializeApp().then(() => {
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port: ${port}`);
});
});