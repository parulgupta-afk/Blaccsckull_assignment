const rateLimit = require('express-rate-limit');

// A generous read limiter for the details screen (it may poll every few
// seconds for spot/countdown freshness) and a tight limiter on the
// register/submit endpoints, since those are the ones worth protecting
// against retry storms / scripting when a competition is about to fill up.
const readLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.RATE_LIMIT_MAX || 120),
  standardHeaders: true,
  legacyHeaders: false,
});

const writeLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, code: 'RATE_LIMITED', message: 'Too many attempts, please slow down.' },
});

module.exports = { readLimiter, writeLimiter };
