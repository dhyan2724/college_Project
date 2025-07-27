const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lab_inventory';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

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

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
}); 