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
      // pravatar.cc serves real (placeholder) portrait photos -- unlike the
      // old example.com URLs, these actually resolve, so the judge photo
      // and winner thumbnails render instead of showing blank/broken images.
      photoUrl: 'https://i.pravatar.cc/300?img=47',
      // A real, public-domain sample video (Google's standard test clip)
      // so tapping "Intro Video" actually opens and plays something,
      // instead of failing on a fake example.com URL. Swap for real judge
      // media when you have it.
      // Verified working (checked directly, returns real video/mp4 bytes) --
      // the previous Google sample-bucket URL started returning an XML
      // AccessDenied/NoSuchKey error instead of video, which is exactly
      // the "xml error" you were seeing. testfiles.dev is a small,
      // purpose-built fixture host for this kind of thing.
      introVideoUrl: 'https://assets.testfiles.dev/video/sample-3s.mp4',
    },

    previousWinners: [
      { name: 'Riya Shah', position: 1, positionLabel: '1st Winner', imageUrl: 'https://i.pravatar.cc/300?img=32' },
      { name: 'Aarav Mehta', position: 1, positionLabel: '1st Winner', imageUrl: 'https://i.pravatar.cc/300?img=12' },
      { name: 'Neha Verma', position: 2, positionLabel: '2nd Winner', imageUrl: 'https://i.pravatar.cc/300?img=45' },
      { name: 'Ishita Chona', position: 3, positionLabel: '3rd Winner', imageUrl: 'https://i.pravatar.cc/300?img=28' },
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
    prizeMoneyExplainerVideoUrl: 'https://assets.testfiles.dev/video/sample-3s.mp4',
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
  console.log('');
  console.log('Paste this line into mobile/.env:');
  console.log(`EXPO_PUBLIC_DEMO_COMPETITION_ID=${competition._id.toString()}`);
  console.log('');
  console.log('Then run this to get your token line:');
  console.log(`  npm run mint-token -- ${demoUser._id.toString()}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
