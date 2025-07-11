require('dotenv').config(); // Load environment variables
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const clubAdminRoutes = require('./routes/clubAdmin');
const eventRoutes = require('./routes/events');
const studentRoutes = require('./routes/student');

const db = require('./db'); // Your DB file should use env variables too

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies only in production (HTTPS)
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

// Example protected route
app.get('/api/dashboard', (req, res) => {
  if (req.session.user) {
    res.json({ message: `Welcome ${req.session.user.name}`, role: req.session.user.role });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
