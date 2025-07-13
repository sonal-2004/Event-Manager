const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ GET /api/events/all - Fetch all events
router.get('/all', async (req, res) => {
  try {
    const [events] = await db.query('SELECT * FROM events ORDER BY date ASC');
    res.json(events);
  } catch (err) {
    console.error('❌ Error fetching all events:', err.message);
    res.status(500).json({ message: 'Failed to retrieve events' });
  }
});

// ✅ GET /api/events/filter?club_name=...&event_type=...
router.get('/filter', async (req, res) => {
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
