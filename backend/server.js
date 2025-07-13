const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const clubAdminRoutes = require('./routes/clubAdmin');
const eventRoutes = require('./routes/events');
const studentRoutes = require('./routes/student');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS config
const corsOptions = {
  origin: process.env.FRONTEND_URL, // e.g. 'https://eventannouncer.vercel.app'
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// ✅ Use CORS before any routes
app.use(cors(corsOptions));

// ✅ Handle preflight for all routes
app.options('*', cors(corsOptions));

// ✅ Body parser
app.use(express.json());

// ✅ Session config
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set to true on Render (HTTPS)
    httpOnly: true,
    sameSite: 'none', // Required for cross-site cookies
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/clubAdmin', clubAdminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/student', studentRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Example protected route
app.get('/api/dashboard', (req, res) => {
  if (req.session.user) {
    res.json({ message: `Welcome ${req.session.user.name}`, role: req.session.user.role });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
