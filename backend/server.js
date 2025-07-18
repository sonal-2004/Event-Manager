// server.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const clubAdminRoutes = require('./routes/clubAdmin');
const eventRoutes = require('./routes/events');
const studentRoutes = require('./routes/student');

const cron = require('node-cron');
const sendEmail = require('./utils/emailService');
const db = require('./db'); // adjust to your db path

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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

// ✅ Cron job to send reminders
cron.schedule('0 10 * * *', async () => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const targetDate = `${yyyy}-${mm}-${dd}`;

    const events = await db.query(`
      SELECT e.name, e.date, s.name as studentName, s.email 
      FROM registrations r
      JOIN students s ON s.id = r.student_id
      JOIN events e ON e.id = r.event_id
      WHERE e.date = ?
    `, [targetDate]);

    for (const row of events) {
      await sendEmail(
        row.email,
        `⏰ Reminder: ${row.name} is Tomorrow!`,
        `<p>Dear ${row.studentName},<br>Your event <b>${row.name}</b> is scheduled for tomorrow.<br>See you there!</p>`
      );
    }

    console.log(`📧 Reminder emails sent for ${targetDate}`);
  } catch (err) {
    console.error('❌ Cron error:', err);
  }
});
