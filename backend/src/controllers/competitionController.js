const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const competitionService = require('../services/competitionService');
const registrationService = require('../services/registrationService');

const getDetails = asyncHandler(async (req, res) => {
  const locale = req.query.locale === 'hi' ? 'hi' : 'en';
  const details = await competitionService.getCompetitionDetails(req.params.id, {
    locale,
    userId: req.user?.id,
  });
  if (!details) throw ApiError.notFound('Competition not found.');
  res.json({ ok: true, data: details });
});

const register = asyncHandler(async (req, res) => {
  const registration = await registrationService.reserveSlot({
    competitionId: req.params.id,
    userId: req.user.id,
    paymentReference: req.body.paymentReference,
  });
  res.status(201).json({
    ok: true,
    data: {
      registrationId: registration._id,
      status: registration.status,
      holdExpiresAt: registration.holdExpiresAt,
      entryFeeDue: registration.entryFeePaid,
    },
  });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const registration = await registrationService.confirmPayment({
    competitionId: req.params.id,
    userId: req.user.id,
    registrationId: req.params.registrationId,
    paymentReference: req.body.paymentReference,
  });
  res.json({ ok: true, data: { registrationId: registration._id, status: registration.status } });
});

const submit = asyncHandler(async (req, res) => {
  const registration = await registrationService.submitEntry({
    competitionId: req.params.id,
    userId: req.user.id,
    mediaUrl: req.body.mediaUrl,
  });
  res.json({
    ok: true,
    data: { registrationId: registration._id, status: registration.status, submission: registration.submission },
  });
});

module.exports = { getDetails, register, confirmPayment, submit };
