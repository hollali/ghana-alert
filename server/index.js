require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.json());

// Database connection
const pool = require('./services/db').pool;
const { requireAuth } = require('./services/requireAuth');

// API Routes
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ status: 'ok', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alerts ORDER BY published_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/alerts/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alerts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/reports', requireAuth, async (req, res) => {
  try {
    const { issue_type, title, description, location, photo_uri } = req.body;
    const result = await pool.query(
      'INSERT INTO reports (issue_type, title, description, location, photo_uri, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [issue_type, title, description, location, photo_uri]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
