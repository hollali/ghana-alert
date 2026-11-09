require('dotenv').config();

const { createRemoteJWKSet, jwtVerify } = require('jose');

let jwksCache = null;
let jwksKey = null;

function getAuthConfig() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL || '';
  if (!baseUrl) return null;
  return { baseUrl: baseUrl.replace(/\/$/, '') };
}

function getJwks(baseUrl) {
  if (jwksCache && jwksKey === baseUrl) return jwksCache;
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL || `${baseUrl}/.well-known/jwks.json`;
  jwksCache = createRemoteJWKSet(new URL(jwksUrl));
  jwksKey = baseUrl;
  return jwksCache;
}

async function validateNeonToken(token) {
  const config = getAuthConfig();
  if (!config) {
    throw new Error('NEON_AUTH_BASE_URL is not set');
  }
  const jwks = getJwks(config.baseUrl);
  const origin = new URL(config.baseUrl).origin;
  const { payload } = await jwtVerify(token, jwks, {
    algorithms: ['EdDSA'],
    issuer: origin,
    audience: origin,
  });
  return payload;
}

module.exports = { validateNeonToken, getAuthConfig };
