require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Competition = require('../models/Competition');
const User = require('../models/User');
const Registration = require('../models/Registration');

async function run() {
  await connectDB(process.env.MONGO_URI);

  await Promise.all([Competition.deleteMany({}), User.deleteMany({}), Registration.deleteMany({})]);

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const demoUser = await User.create({
    name: 'Demo Participant',
    email: 'demo@feedants.com',
  });

  const competition = await Competition.create({
    title: 'Feedants Classical Dance',
    tags: ['Dance', 'Multi-Win'],
    winnersGetCertificate: true,

    prizePool: 1500,
    currency: 'INR',
    entryFee: 99,

    maxParticipants: 20,
    confirmedParticipants: 1, // matches "1 / 20 Booked" in the design

    registrationDeadline: new Date(now + 1 * day + 6 * 60 * 60 * 1000 + 28 * 60 * 1000),
    submissionStartsAt: new Date(now - 2 * day),
    submissionEndsAt: new Date(now + 8 * day),
    resultDate: new Date(now + 10 * day),

    judge: {
      name: 'Manju Dubey',
      title: { en: 'Professional Kathak Dancer', hi: 'व्यावसायिक कथक नर्तकी' },
      experienceLabel: { en: '12+ Years of Experience', hi: '12+ वर्षों का अनुभव' },
      photoUrl: 'https://example.com/judges/manju-dubey.jpg',
      introVideoUrl: 'https://example.com/videos/manju-dubey-intro.mp4',
    },

    previousWinners: [
      { name: 'Riya Shah', position: 1, positionLabel: '1st Winner', imageUrl: 'https://example.com/winners/riya.jpg' },
      { name: 'Aarav Mehta', position: 1, positionLabel: '1st Winner', imageUrl: 'https://example.com/winners/aarav.jpg' },
      { name: 'Neha Verma', position: 2, positionLabel: '2nd Winner', imageUrl: 'https://example.com/winners/neha.jpg' },
      { name: 'Ishita Chona', position: 3, positionLabel: '3rd Winner', imageUrl: 'https://example.com/winners/ishita.jpg' },
    ],

    rewards: [
      { position: 1, label: { en: '1st Winner' }, amount: 550 },
      { position: 2, label: { en: '2nd Winner' }, amount: 300 },
      { position: 3, label: { en: '3rd Winner' }, amount: 240 },
      { position: 4, label: { en: '4th Winner' }, amount: 200 },
      { position: 5, label: { en: '5th Winner' }, amount: 130 },
      { position: 6, label: { en: '6th Winner' }, amount: 80 },
    ],

    tabContent: {
      about: {
        en: 'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
        hi: 'यह सभी आयु समूहों के लिए खुली एक ऑनलाइन शास्त्रीय नृत्य प्रतियोगिता है। कहीं से भी भाग लें और अपनी प्रतिभा दिखाएं।',
      },
      judgingParameters: {
        en: 'Technique, expression (abhinaya), rhythm accuracy, costume & presentation, and originality of choreography.',
      },
      rulesAndEligibility: {
        en: 'Open to all ages. One submission per participant. Entry must be an original, unedited performance video under 5 minutes.',
      },
    },

    disclaimer: { en: 'Only contributions from paid participants will be considered for judging.' },
    prizeMoneyExplainerVideoUrl: 'https://example.com/videos/how-you-get-paid.mp4',
    refundPolicyUrl: 'https://feedants.com/refund-policy',
    paymentProvider: 'razorpay',
    referralBaseUrl: 'https://feedants.com/r/',

    adminStatus: 'published',
  });

  await Registration.create({
    competition: competition._id,
    user: demoUser._id,
    status: 'confirmed',
    entryFeePaid: 99,
    paymentReference: 'seed_demo_payment',
  });

  console.log('[seed] created competition:', competition._id.toString());
  console.log('[seed] demo user:', demoUser._id.toString());
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
