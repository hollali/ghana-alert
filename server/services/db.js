require('dotenv').config();

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy from Neon console into server/.env (never commit it).');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT NOW() as current_time', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to Neon PostgreSQL:', res.rows[0].current_time);
  }
});

module.exports = { pool };
