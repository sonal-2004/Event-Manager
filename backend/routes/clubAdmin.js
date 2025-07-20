const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middlewares/cloudinaryUpload');

// ===== Middleware: Only Club Admins Allowed =====
function isClubAdmin(req, res, next) {
  const user = req.session.user;
  if (user && user.role === 'club_admin') {
    req.user = user;
    next();
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
}

// ===== Create New Event =====
router.post('/events', isClubAdmin, upload.single('poster'), async (req, res) => {
  console.log('➡️ Creating event by:', req.session.user);
  console.log('   req.body:', req.body);
  console.log('   req.file:', req.file);

  const { title, description, date, time, location, event_type, club_name } = req.body;
  const created_by = req.user.id;
  const poster = req.file?.path || null;

  if (!title || !description || !date || !time || !location || !event_type || !club_name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [result] = await db.execute(`
      INSERT INTO events
      (title, description, date, time, location, poster, created_by, club_name, event_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, date, time, location, poster, created_by, club_name, event_type]
    );
    console.log('✅ Event inserted ID:', result.insertId);
    res.json({ message: 'Event created successfully', id: result.insertId });
  } catch (err) {
    console.error('❌ DB Error /events:', err);
    res.status(500).json({ message: 'Error creating event' });
  }
});


// ===== Edit Event (with optional new poster) =====
// ===== Edit Event (with optional new poster) =====
router.put('/event/:eventId', isClubAdmin, upload.single('poster'), async (req, res) => {
  const eventId = req.params.eventId;
  const allowedFields = ['title', 'description', 'date', 'time', 'location', 'event_type', 'club_name'];
  const updateFields = [];
  const values = [];

  for (const field of allowedFields) {
    if (req.body[field] && req.body[field].trim() !== '') {
      updateFields.push(`${field} = ?`);
      values.push(req.body[field].trim());
    }
  }

  if (req.file) {
    updateFields.push('poster = ?');
    values.push(req.file.path);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: 'No valid fields provided for update' });
  }

  try {
    const [check] = await db.execute('SELECT * FROM events WHERE id = ? AND created_by = ?', [eventId, req.user.id]);
    if (check.length === 0) {
      return res.status(403).json({ message: 'Unauthorized to edit this event.' });
    }

    const updateQuery = `UPDATE events SET ${updateFields.join(', ')} WHERE id = ?`;
    values.push(eventId);
    await db.execute(updateQuery, values);

    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error('❌ Error updating event:', err);
    res.status(500).json({ message: 'Internal server error while updating event' });
  }
});

// ===== Get My Events =====
router.get('/my-events', isClubAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM events WHERE created_by = ?', [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// ===== Get Registrations =====
router.get('/event/:eventId/registrations', isClubAdmin, async (req, res) => {
  const eventId = req.params.eventId;

  try {
    const [students] = await db.execute(
      `SELECT u.id, u.name, u.email FROM student_registrations sr
       JOIN users u ON sr.student_id = u.id
       WHERE sr.event_id = ?`,
      [eventId]
    );
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});

// ===== Delete Event =====
router.delete('/event/:eventId', isClubAdmin, async (req, res) => {
  const eventId = req.params.eventId;
  try {
    await db.execute('DELETE FROM events WHERE id = ?', [eventId]);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

module.exports = router;
