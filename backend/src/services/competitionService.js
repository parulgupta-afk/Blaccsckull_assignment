const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const { getUserRegistration } = require('./registrationService');

const pickLocale = (localized, locale) => {
  if (!localized) return undefined;
  return localized[locale] || localized.en;
};

/**
 * The client should never have to know how "spots left", "registration
 * open", or "registered" are derived -- that logic lives once, here, on the
 * server, and is served as plain booleans/numbers. This keeps the mobile
 * app dumb-and-reactive (render what the API says) instead of re-deriving
 * business rules from raw dates on-device, which would drift the moment
 * device clocks are wrong or the rules change.
 */
async function getCompetitionDetails(competitionId, { locale = 'en', userId } = {}) {
  let competition = null;
  if (competitionId && mongoose.isValidObjectId(competitionId)) {
    competition = await Competition.findOne({ _id: competitionId, adminStatus: { $ne: 'archived' } });
  }

  // Graceful fallback for demo/seed: if ID is not found, load the latest published competition
  if (!competition) {
    competition = await Competition.findOne({ adminStatus: { $ne: 'archived' } }).sort({ createdAt: -1 });
  }

  if (!competition) return null;

  const lifecycle = competition.computeLifecycle();
  const registration = await getUserRegistration(competition._id, userId);

  return {
    id: competition._id,
    title: competition.title,
    tags: competition.tags,
    winnersGetCertificate: competition.winnersGetCertificate,

    prizePool: competition.prizePool,
    currency: competition.currency,
    entryFee: competition.entryFee,

    capacity: {
      maxParticipants: competition.maxParticipants,
      confirmedParticipants: competition.confirmedParticipants,
      spotsLeft: lifecycle.spotsLeft,
      isFull: lifecycle.isFull,
    },

    dates: {
      registrationDeadline: competition.registrationDeadline,
      submissionStartsAt: competition.submissionStartsAt,
      submissionEndsAt: competition.submissionEndsAt,
      resultDate: competition.resultDate,
    },

    judge: {
      name: competition.judge.name,
      title: pickLocale(competition.judge.title, locale),
      experienceLabel: pickLocale(competition.judge.experienceLabel, locale),
      photoUrl: competition.judge.photoUrl,
      introVideoUrl: competition.judge.introVideoUrl,
    },

    previousWinners: competition.previousWinners.map((w) => ({
      name: w.name,
      position: w.position,
      positionLabel: w.positionLabel,
      imageUrl: w.imageUrl,
      videoUrl: w.videoUrl,
    })),

    rewards: competition.rewards
      .sort((a, b) => a.position - b.position)
      .map((r) => ({ position: r.position, label: pickLocale(r.label, locale), amount: r.amount })),

    tabs: {
      about: pickLocale(competition.tabContent.about, locale),
      judgingParameters: pickLocale(competition.tabContent.judgingParameters, locale),
      rulesAndEligibility: pickLocale(competition.tabContent.rulesAndEligibility, locale),
    },

    disclaimer: pickLocale(competition.disclaimer, locale),
    prizeMoneyExplainerVideoUrl: competition.prizeMoneyExplainerVideoUrl,
    refundPolicyUrl: competition.refundPolicyUrl,
    paymentProvider: competition.paymentProvider,
    referralBaseUrl: competition.referralBaseUrl,

    // Server-computed, so the client just renders -- it never re-derives
    // business rules from raw dates.
    lifecycle: {
      phase: lifecycle.phase, // registration_open | registration_closed | submission_open | judging | completed
      registrationOpen: lifecycle.registrationOpen,
      submissionOpen: lifecycle.submissionOpen,
    },

    viewer: {
      isAuthenticated: Boolean(userId),
      registrationStatus: registration ? registration.status : 'not_registered',
      registrationId: registration ? registration._id : null,
      hasSubmitted: registration?.status === 'submitted',
    },

    serverTime: new Date(), // client anchors all countdowns to this, not device clock
  };
}

module.exports = { getCompetitionDetails, pickLocale };
