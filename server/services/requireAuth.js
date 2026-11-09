const { validateNeonToken } = require('./neonAuth');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ error: 'Missing Bearer token' });
  }

  try {
    const payload = await validateNeonToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      emailVerified: payload.emailVerified,
    };
    next();
  } catch (err) {
    const isConfig = err && err.message === 'NEON_AUTH_BASE_URL is not set';
    if (isConfig) {
      return res.status(503).json({ error: 'Auth not configured on server' });
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth };
