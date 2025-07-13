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

// ✅ Trust proxy if behind Render or Heroku
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ✅ Correct CORS config
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60
  }
}));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/clubAdmin', clubAdminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/student', studentRoutes);

app.get('/api/dashboard', (req, res) => {
  if (req.session.user) {
    res.json({ message: `Welcome ${req.session.user.name}`, role: req.session.user.role });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.get('/', (req, res) => {
  res.send('🌐 Campus Events API is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
