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

// ✅ CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL, // e.g., 'https://eventannouncer.vercel.app'
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight support

// ✅ Body parser
app.use(express.json());

// ✅ Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    sameSite: 'none', // Required for cross-origin cookies
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// ✅ Serve static uploads (e.g., event images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/clubAdmin', clubAdminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/student', studentRoutes);

// ✅ Example protected route
app.get('/api/dashboard', (req, res) => {
  if (req.session.user) {
    res.json({ message: `Welcome ${req.session.user.name}`, role: req.session.user.role });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// ✅ Default route for base URL to remove "Cannot GET /"
app.get('/', (req, res) => {
  res.send('🌐 Campus Events API is running!');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
