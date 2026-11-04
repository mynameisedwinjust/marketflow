const HttpError = require('../utils/httpError');

// Usage: router.post('/', requireRole(STAFF), handler)
module.exports = function requireRole(allowed) {
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return next(new HttpError(403, 'Your role does not have access to this action.'));
    }
    next();
  };
};
