const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Lifecycle of a single user's participation in a single competition.
 *
 *   pending_payment -> confirmed -> submitted
 *          |               |
 *          v               v
 *      expired          cancelled (rare; e.g. refund)
 *
 * Only `confirmed` and `submitted` registrations count toward
 * Competition.confirmedParticipants / "spots booked". `pending_payment`
 * holds a soft, time-boxed claim (see REGISTRATION_HOLD_TTL_SECONDS) so two
 * users racing for the last spot don't both get told "payment succeeded"
 * for a slot that only one of them actually has.
 */
const REGISTRATION_STATUS = [
  'pending_payment',
  'confirmed',
  'submitted',
  'cancelled',
  'expired',
];

const RegistrationSchema = new Schema(
  {
    competition: { type: Schema.Types.ObjectId, ref: 'Competition', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    status: { type: String, enum: REGISTRATION_STATUS, default: 'pending_payment' },

    entryFeePaid: { type: Number, required: true, min: 0 },
    paymentProvider: { type: String, default: 'razorpay' },
    paymentReference: { type: String }, // Razorpay order/payment id
    holdExpiresAt: { type: Date }, // only set while status === 'pending_payment'

    submission: {
      mediaUrl: { type: String },
      submittedAt: { type: Date },
    },

    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// A user may hold at most one *active* registration per competition.
// Partial unique index: only enforced across statuses that represent a
// live claim on a slot, so an `expired`/`cancelled` row doesn't block a
// legitimate retry.
RegistrationSchema.index(
  { competition: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending_payment', 'confirmed', 'submitted'] },
    },
  }
);

module.exports = mongoose.model('Registration', RegistrationSchema);
module.exports.REGISTRATION_STATUS = REGISTRATION_STATUS;
