const express = require('express');
const { getDetails, register, confirmPayment, submit } = require('../controllers/competitionController');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { readLimiter, writeLimiter } = require('../middleware/rateLimiter');
const { registerSchema, submitSchema } = require('../validators/competitionValidators');

const router = express.Router();

// Viewable by guests: competition info is public, but response is
// personalized (registration state) when a valid token is present.
router.get('/:id', readLimiter, optionalAuth, getDetails);

router.post(
  '/:id/register',
  writeLimiter,
  requireAuth,
  validate(registerSchema),
  register
);

router.post(
  '/:id/registrations/:registrationId/confirm-payment',
  writeLimiter,
  requireAuth,
  validate(registerSchema),
  confirmPayment
);

router.post(
  '/:id/submissions',
  writeLimiter,
  requireAuth,
  validate(submitSchema),
  submit
);

module.exports = router;
