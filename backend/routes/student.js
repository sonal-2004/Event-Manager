const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendRegistrationEmail } = require("../utils/emailService");

// ✅ Middleware: Only allow logged-in students
const isStudent = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'student') {
    return res.status(401).json({ message: 'You must log in as a student' });
  }
  next();
};

// ✅ Route: Register for an event
router.post('/register/:eventId', isStudent, async (req, res) => {
  const studentId = req.session.user.id;
  const eventId = req.params.eventId;

  try {
    const [existing] = await db.query(
      'SELECT * FROM student_registrations WHERE student_id = ? AND event_id = ?',
      [studentId, eventId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already registered' });
    }

    await db.query(
      'INSERT INTO student_registrations (student_id, event_id) VALUES (?, ?)',
      [studentId, eventId]
    );

    const [[student]] = await db.query('SELECT name, email FROM students WHERE id = ?', [studentId]);
    const [[event]] = await db.query('SELECT title FROM events WHERE id = ?', [eventId]);

    // 📧 Optional: Send confirmation email
    try {
  await sendRegistrationEmail(student.email, student.name, event.title);
} catch (emailError) {
  console.error('Failed to send registration email:', emailError);
}


    res.status(200).json({ message: `Registered successfully for ${event.title}` });
  } catch (err) {
    console.error('❌ Error in register route:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.get('/test-email', async (req, res) => {
  try {
    await sendRegistrationEmail('deshmukhsayali080804@gmail.com', 'Test User', 'Test Event');
    res.send('Test email sent!');
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).send('Failed to send test email');
  }
});

// ✅ Route: Get all events (for logged-in students only)
// Unique club names
router.get('/clubs', async (req, res) => {
  try {
    const [clubs] = await db.query('SELECT DISTINCT club_name FROM events');
    res.json(clubs.map(c => c.club_name));
  } catch (err) {
    console.error('❌ Error fetching club names:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ✅ Route: Get events student is registered for
router.get('/registered', isStudent, async (req, res) => {
  try {
    const studentId = req.session.user.id;

    const [rows] = await db.query(
      `SELECT e.* FROM student_registrations sr
       JOIN events e ON sr.event_id = e.id
       WHERE sr.student_id = ?
       ORDER BY e.date ASC`,
      [studentId]
    );

    res.json(rows);
  } catch (err) {
    console.error('❌ Error in /registered route:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Route: Filter events by club_name and/or event_type
router.get('/filter', isStudent, async (req, res) => {
  const { club_name, event_type } = req.query;

  let query = 'SELECT * FROM events WHERE 1=1';
  const params = [];

  if (club_name) {
    query += ' AND club_name = ?';
    params.push(club_name);
  }

  if (event_type) {
    query += ' AND event_type = ?';
    params.push(event_type);
  }

  query += ' ORDER BY date ASC';

  try {
    const [results] = await db.query(query, params);
    res.json(results);
  } catch (err) {
    console.error('❌ Error filtering events:', err.message);
    res.status(500).json({ error: 'Failed to retrieve filtered events' });
  }
});

module.exports = router;
