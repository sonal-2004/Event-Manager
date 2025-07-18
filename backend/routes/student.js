const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Middleware: Only allow logged-in students
const isStudent = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'student') {
    return res.status(401).json({ message: 'You must log in as a student' });
  }
  next();
};

// ✅ Register for event
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

    // Get event title for confirmation
    const [[event]] = await db.query('SELECT title FROM events WHERE id = ?', [eventId]);

    res.status(200).json({ message: `Registered successfully for ${event.title}` });
  } catch (err) {
    console.error('❌ Error registering:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Get all events
router.get('/all', async (req, res) => {
  try {
    const [events] = await db.query('SELECT * FROM events ORDER BY date ASC');
    res.json(events);
  } catch (err) {
    console.error('❌ Error fetching events:', err.message);
    res.status(500).json({ message: 'Failed to retrieve events' });
  }
});

// ✅ Get registered events for logged-in student
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
    console.error('❌ Error fetching registered events:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
