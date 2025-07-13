const express = require('express');
const router = express.Router();
const db = require('../db'); // Your MySQL connection

// GET /api/events/all - Fetch all events
// GET /api/events/filter?club_name=...&event_type=...
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
