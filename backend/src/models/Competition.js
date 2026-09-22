const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Localized string: every user-facing text field is stored per-locale so the
 * ENG / हिंदी toggle in the design is backed by real data, not client-side
 * hardcoded strings. Falls back to English if a locale is missing.
 */
const LocalizedStringSchema = new Schema(
  {
    en: { type: String, required: true, trim: true },
    hi: { type: String, trim: true },
  },
  { _id: false }
);

const RewardSchema = new Schema(
  {
    position: { type: Number, required: true, min: 1 },
    label: { type: LocalizedStringSchema, required: true }, // "1st Winner"
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PreviousWinnerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: Number, required: true, min: 1 },
    positionLabel: { type: String, required: true }, // "1st Winner" (display only, historical)
    imageUrl: { type: String, required: true },
    videoUrl: { type: String },
  },
  { _id: false }
);

const JudgeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: LocalizedStringSchema, required: true }, // "Professional Kathak Dancer"
    experienceLabel: { type: LocalizedStringSchema, required: true }, // "12+ Years of Experience"
    photoUrl: { type: String, required: true },
    introVideoUrl: { type: String },
  },
  { _id: false }
);

const TabContentSchema = new Schema(
  {
    about: { type: LocalizedStringSchema, required: true },
    judgingParameters: { type: LocalizedStringSchema, required: true },
    rulesAndEligibility: { type: LocalizedStringSchema, required: true },
  },
  { _id: false }
);

/**
 * Competitions move through a lifecycle driven purely by dates + capacity.
 * We do NOT trust a manually-set "status" field as the source of truth for
 * user-facing behavior (a cron/admin could forget to flip it); instead the
 * authoritative lifecycle is computed on read via `computeLifecycle()`.
 * `adminStatus` exists only for soft-disable / moderation (e.g. draft, archived).
 */
const ADMIN_STATUS = ['draft', 'published', 'archived'];

const CompetitionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }], // ["Dance", "Multi-Win"]
    winnersGetCertificate: { type: Boolean, default: false },

    prizePool: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    entryFee: { type: Number, required: true, min: 0 },

    maxParticipants: { type: Number, required: true, min: 1 },
    // Denormalized, atomically-maintained counter. This is the fast path for
    // "spots left" reads at scale; it is kept consistent with the
    // Registration collection via atomic $inc operations guarded by
    // conditional filters (see registrationService). It is NEVER trusted as
    // the sole source of truth for financial/legal correctness -- a nightly
    // reconciliation job recomputes it from Registration counts.
    confirmedParticipants: { type: Number, default: 0, min: 0 },

    registrationDeadline: { type: Date, required: true },
    submissionStartsAt: { type: Date, required: true },
    submissionEndsAt: { type: Date, required: true },
    resultDate: { type: Date, required: true },

    judge: { type: JudgeSchema, required: true },
    previousWinners: [PreviousWinnerSchema],
    rewards: [RewardSchema],
    tabContent: { type: TabContentSchema, required: true },

    disclaimer: { type: LocalizedStringSchema },
    prizeMoneyExplainerVideoUrl: { type: String },
    refundPolicyUrl: { type: String },
    paymentProvider: { type: String, default: 'razorpay' },
    referralBaseUrl: { type: String },

    adminStatus: { type: String, enum: ADMIN_STATUS, default: 'published' },
  },
  { timestamps: true }
);

CompetitionSchema.index({ adminStatus: 1, registrationDeadline: 1 });

/**
 * Pure function: given "now", derive the lifecycle phase and whether
 * registration/submission actions are currently allowed. Kept pure (no DB
 * calls) so it's trivially unit-testable and can be reused on both the read
 * path (GET details) and the write path (register/submit) to make the
 * exact same decision.
 */
CompetitionSchema.methods.computeLifecycle = function computeLifecycle(now = new Date()) {
  const spotsLeft = Math.max(this.maxParticipants - this.confirmedParticipants, 0);
  const isFull = spotsLeft <= 0;
  const registrationOpen =
    this.adminStatus === 'published' && now < this.registrationDeadline && !isFull;

  let phase;
  if (this.adminStatus !== 'published') phase = 'unpublished';
  else if (now >= this.resultDate) phase = 'completed';
  else if (now >= this.submissionEndsAt) phase = 'judging';
  else if (now >= this.submissionStartsAt) phase = 'submission_open';
  else if (now >= this.registrationDeadline || isFull) phase = 'registration_closed';
  else phase = 'registration_open';

  return {
    phase,
    spotsLeft,
    isFull,
    registrationOpen,
    submissionOpen: phase === 'submission_open',
  };
};

module.exports = mongoose.model('Competition', CompetitionSchema);
