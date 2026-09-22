const { z } = require('zod');

const registerSchema = z.object({
  // In production this would be a Razorpay order id created client-side via
  // a separate /payments/order endpoint, then verified server-side via
  // webhook/signature before the registration is "confirmed". We accept a
  // paymentReference here to keep the flow demonstrable without wiring a
  // live payment gateway (see README "trade-offs").
  paymentReference: z.string().min(1).optional(),
});

const submitSchema = z.object({
  mediaUrl: z.string().url({ message: 'A valid submission media URL is required.' }),
});

module.exports = { registerSchema, submitSchema };
