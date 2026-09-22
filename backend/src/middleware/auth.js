const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/ApiError');

/**
 * This assignment is scoped to the Competition Details feature; a full auth
 * service is out of scope. We assume the mobile app already holds a JWT
 * issued elsewhere (login/signup flow) and just verify it here.
 *
 * `optionalAuth` lets the details endpoint be viewed by guests (they'll see
 * competition info + a "Login to register" CTA) while still personalizing
 * the response when a valid token is present.
 */
function decodeToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function optionalAuth(req, res, next) {
  const payload = decodeToken(req);
  req.user = payload ? { id: payload.sub } : null;
  next();
}

function requireAuth(req, res, next) {
  const payload = decodeToken(req);
  if (!payload) return next(ApiError.unauthorized('Please log in to continue.'));
  req.user = { id: payload.sub };
  next();
}

module.exports = { optionalAuth, requireAuth };
