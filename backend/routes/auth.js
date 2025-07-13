const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db'); // mysql2/promise connection

// ===== SIGNUP =====
router.post('/signup', async (req, res) => {
  const { name, email, password, phone, department, role, club_name } = req.body;

  if (!name || !email || !password || !phone || !department || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (name, email, password, phone, department, role, club_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, phone, department, role, club_name || null]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('❌ Signup error:', error.message);
    res.status(500).json({ message: 'Signup failed. Server error.' });
  }
});

// ===== LOGIN =====
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'User not found' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // ✅ Store session
    req.session.user = {
      id: user.id,
      name: user.name,
      role: user.role,
      club_name: user.club_name || null,
    };

    res.json({ message: 'Login successful', user: req.session.user });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ message: 'Login failed. Server error.' });
  }
});

// ===== WHOAMI (Debug/Session Check) =====
router.get('/whoami', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

// ===== LOGOUT =====
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('session_cookie_name'); // adjust this to match your session cookie name
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
