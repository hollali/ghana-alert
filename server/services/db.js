require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_41EapbRQoWci@ep-still-unit-za1g32u9.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

pool.query('SELECT NOW() as current_time', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to Neon PostgreSQL:', res.rows[0].current_time);
  }
});

module.exports = { pool };