const { ApiError } = require('../utils/ApiError');

function notFoundHandler(req, res) {
  res.status(404).json({ ok: false, code: 'ROUTE_NOT_FOUND', message: `No route: ${req.method} ${req.originalUrl}` });
}

// Centralized error formatting so every failure -- validation, business
// rule, duplicate key, unexpected -- reaches the client in one consistent
// shape: { ok: false, code, message, details? }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      ok: false,
      code: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Mongo duplicate key -> almost always our partial unique index catching
  // a double registration race that slipped past the application check.
  if (err.code === 11000) {
    return res.status(409).json({
      ok: false,
      code: 'ALREADY_REGISTERED',
      message: 'You already have an active registration for this competition.',
    });
  }

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ ok: false, code: 'VALIDATION_ERROR', message: err.message });
  }

  console.error('[unhandled]', err);
  return res.status(500).json({ ok: false, code: 'INTERNAL_ERROR', message: 'Something went wrong.' });
}

module.exports = { errorHandler, notFoundHandler };
