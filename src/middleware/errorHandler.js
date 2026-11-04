const config = require('../config');

exports.notFound = (req, res, next) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found.' });
  next();
};

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 && config.isProd ? 'Server error.' : err.message });
};
