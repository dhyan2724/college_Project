// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testConnection, initializeDatabase } = require('./config/supabase');
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
const allowedOrigins = ['https://nuvsoslabs.netlify.app', 'http://nuvsoslabs.in'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.) always allow
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Initialize Supabase database
const initializeApp = async () => {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.warn('Warning: Could not connect to Supabase. Please check your environment variables.');
    }
    
    // Initialize database schema (provides instructions)
    await initializeDatabase();
    
    console.log('Supabase connection ready');
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
    // Don't exit - allow server to start even if Supabase isn't configured yet
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