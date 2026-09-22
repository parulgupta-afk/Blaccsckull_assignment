const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Minimal stand-in. In the real Feedants app, users/auth almost certainly
 * already exist as their own service -- this assignment is scoped to the
 * Competition Details feature, so we model just enough of User to make
 * registration/ownership checks meaningful and demonstrable end-to-end.
 */
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    profileImageUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
