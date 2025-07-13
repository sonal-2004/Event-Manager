const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to check if student is logged in
const isStudent = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'student') {
    return res.status(401).json({ message: 'You must log in as a student' });
  }
  next();
};

// Register for an event
router.post('/register/:eventId', isStudent, async (req, res) => {
  const studentId = req.session.user.id;
  const eventId = req.params.eventId;

  try {
    const [existing] = await db.query(
      'SELECT * FROM registrations WHERE student_id = ? AND event_id = ?',
      [studentId, eventId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already registered' });
    }

    await db.query(
      'INSERT INTO registrations (student_id, event_id) VALUES (?, ?)',
      [studentId, eventId]
    );

    res.status(200).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('Error in register route:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get list of registered event IDs for the logged-in student
router.get('/registered', isStudent, async (req, res) => {
  try {
    console.log('Student ID:', req.session.user?.id);

    const [rows] = await db.query(
      'SELECT event_id FROM registrations WHERE student_id = ?',
      [req.session.user.id]
    );

    console.log('Query result:', rows);
    const eventIds = rows.map(row => row.event_id);

    res.json(eventIds);
  } catch (err) {
    console.error('Error fetching registered events:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
