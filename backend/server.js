require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const clubAdminRoutes = require('./routes/clubAdmin');
const eventRoutes = require('./routes/events');
const studentRoutes = require('./routes/student');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy if behind a proxy in production (e.g. Render, Heroku)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
app.use(express.json());

// ✅ CORS configuration - allow ALL origins
app.use(cors());

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60, // 1 hour
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clubAdmin', clubAdminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/student', studentRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route - avoids "Cannot GET /"
app.get('/', (req, res) => {
  res.send('✅ API Server is running!');
});

// Example protected route
app.get('/api/dashboard', (req, res) => {
  if (req.session.user) {
    res.json({
      message: `Welcome ${req.session.user.name}`,
      role: req.session.user.role
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
