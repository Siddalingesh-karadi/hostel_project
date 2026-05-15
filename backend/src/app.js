const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const feeRoutes = require('./routes/feeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const messMenuRoutes = require('./routes/messMenuRoutes');
const adminRoutes = require('./routes/adminRoutes');
const broadcastRoutes = require('./routes/broadcastRoutes');
const housekeeperRoutes = require('./routes/housekeeperRoutes');
const securityRoutes = require('./routes/securityRoutes');
const messageRoutes = require('./routes/messageRoutes');


// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HostelHub API' });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend connection successful!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/mess-menu', messMenuRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/housekeeper', housekeeperRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/messages', messageRoutes);


// Simple Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!'
  });
});

module.exports = app;
