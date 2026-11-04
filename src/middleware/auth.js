const jwt = require('jsonwebtoken');
const config = require('../config');
const HttpError = require('../utils/httpError');

// Requires a valid login cookie. Puts { id, role, name, username } on req.user.
module.exports = function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies[config.cookieName];
  if (!token) return next(new HttpError(401, 'Please sign in.'));
  try {
    const p = jwt.verify(token, config.jwtSecret);
    req.user = { id: p.sub, role: p.role, name: p.name, username: p.username };
    next();
  } catch {
    next(new HttpError(401, 'Your session has expired. Please sign in again.'));
  }
};
