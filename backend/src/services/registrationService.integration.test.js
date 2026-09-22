/**
 * These tests exercise the actual atomic-registration path against a real
 * MongoDB replica set (multi-document transactions require one -- a
 * standalone mongod will throw "Transaction numbers are only allowed on a
 * replica set member or mongos"). They are NOT run as part of `npm test`
 * by default in this sandbox: there is no MongoDB reachable in the
 * container this was authored in, and mongodb-memory-server's binary
 * download is blocked by the sandbox's network allowlist. They are real,
 * runnable tests -- just ones that need YOUR machine's database.
 *
 * To run them:
 *   1. Have a MongoDB replica set reachable (a local `mongod --replSet rs0`
 *      + `rs.initiate()`, or a free MongoDB Atlas cluster).
 *   2. TEST_MONGO_URI=mongodb://127.0.0.1:27017/feedants_test npm run test:integration
 *
 * Without TEST_MONGO_URI set, this whole suite is skipped (not failed) so
 * `npm test` stays green in environments without a DB.
 */
const mongoose = require('mongoose');

const TEST_MONGO_URI = process.env.TEST_MONGO_URI;
const describeIfDb = TEST_MONGO_URI ? describe : describe.skip;

describeIfDb('registrationService (integration, requires MongoDB replica set)', () => {
  let Competition;
  let Registration;
  let User;
  let registrationService;

  beforeAll(async () => {
    await mongoose.connect(TEST_MONGO_URI);
    Competition = require('../models/Competition');
    Registration = require('../models/Registration');
    User = require('../models/User');
    registrationService = require('./registrationService');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Promise.all([Competition.deleteMany({}), Registration.deleteMany({}), User.deleteMany({})]);
  });

  async function makeCompetition(overrides = {}) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    return Competition.create({
      title: 'Test Competition',
      prizePool: 1000,
      entryFee: 50,
      maxParticipants: 1,
      confirmedParticipants: 0,
      registrationDeadline: new Date(now + day),
      submissionStartsAt: new Date(now - day),
      submissionEndsAt: new Date(now + 5 * day),
      resultDate: new Date(now + 7 * day),
      judge: { name: 'J', title: { en: 'T' }, experienceLabel: { en: 'E' }, photoUrl: 'https://x.test/p.jpg' },
      tabContent: { about: { en: 'a' }, judgingParameters: { en: 'j' }, rulesAndEligibility: { en: 'r' } },
      adminStatus: 'published',
      ...overrides,
    });
  }

  async function makeUser(email) {
    return User.create({ name: 'Test User', email });
  }

  it('registers a user for an open competition with a spot free', async () => {
    const competition = await makeCompetition({ maxParticipants: 5 });
    const user = await makeUser('a@test.com');

    const registration = await registrationService.reserveSlot({
      competitionId: competition._id,
      userId: user._id,
    });

    expect(registration.status).toBe('pending_payment');
    const updated = await Competition.findById(competition._id);
    expect(updated.confirmedParticipants).toBe(1);
  });

  it('rejects a second registration attempt when the competition is full', async () => {
    const competition = await makeCompetition({ maxParticipants: 1 });
    const userA = await makeUser('a@test.com');
    const userB = await makeUser('b@test.com');

    await registrationService.reserveSlot({ competitionId: competition._id, userId: userA._id });

    await expect(
      registrationService.reserveSlot({ competitionId: competition._id, userId: userB._id })
    ).rejects.toMatchObject({ code: 'COMPETITION_FULL' });
  });

  it('allows only one winner when many users race for the last spot concurrently', async () => {
    const competition = await makeCompetition({ maxParticipants: 1 });
    const users = await Promise.all(
      Array.from({ length: 10 }, (_, i) => makeUser(`racer${i}@test.com`))
    );

    const results = await Promise.allSettled(
      users.map((u) => registrationService.reserveSlot({ competitionId: competition._id, userId: u._id }))
    );

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(fulfilled).toHaveLength(1); // exactly one winner, never zero, never two
    expect(rejected).toHaveLength(9);

    const finalCompetition = await Competition.findById(competition._id);
    expect(finalCompetition.confirmedParticipants).toBe(1); // never overbooked
  });

  it('rejects registration after the registration deadline has passed', async () => {
    const competition = await makeCompetition({ registrationDeadline: new Date(Date.now() - 1000) });
    const user = await makeUser('late@test.com');

    await expect(
      registrationService.reserveSlot({ competitionId: competition._id, userId: user._id })
    ).rejects.toMatchObject({ code: 'REGISTRATION_CLOSED' });
  });

  it('rejects a duplicate active registration for the same user', async () => {
    const competition = await makeCompetition({ maxParticipants: 5 });
    const user = await makeUser('dup@test.com');

    await registrationService.reserveSlot({ competitionId: competition._id, userId: user._id });

    await expect(
      registrationService.reserveSlot({ competitionId: competition._id, userId: user._id })
    ).rejects.toMatchObject({ code: 'ALREADY_REGISTERED' });
  });

  it('rejects a submission outside the submission window', async () => {
    const competition = await makeCompetition({
      maxParticipants: 5,
      submissionStartsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // starts in the future
    });
    const user = await makeUser('early@test.com');
    const reg = await registrationService.reserveSlot({ competitionId: competition._id, userId: user._id });
    await registrationService.confirmPayment({
      competitionId: competition._id,
      userId: user._id,
      registrationId: reg._id,
    });

    await expect(
      registrationService.submitEntry({
        competitionId: competition._id,
        userId: user._id,
        mediaUrl: 'https://example.com/video.mp4',
      })
    ).rejects.toMatchObject({ code: 'SUBMISSION_WINDOW_CLOSED' });
  });

  it('rejects a submission from a user who never confirmed a registration', async () => {
    const competition = await makeCompetition({ maxParticipants: 5 });
    const user = await makeUser('nosub@test.com');

    await expect(
      registrationService.submitEntry({
        competitionId: competition._id,
        userId: user._id,
        mediaUrl: 'https://example.com/video.mp4',
      })
    ).rejects.toMatchObject({ code: 'NOT_REGISTERED' });
  });

  it('accepts a submission once registration is confirmed and the submission window is open', async () => {
    const competition = await makeCompetition({ maxParticipants: 5 });
    const user = await makeUser('good@test.com');
    const reg = await registrationService.reserveSlot({ competitionId: competition._id, userId: user._id });
    await registrationService.confirmPayment({
      competitionId: competition._id,
      userId: user._id,
      registrationId: reg._id,
    });

    const submitted = await registrationService.submitEntry({
      competitionId: competition._id,
      userId: user._id,
      mediaUrl: 'https://example.com/video.mp4',
    });

    expect(submitted.status).toBe('submitted');
    expect(submitted.submission.mediaUrl).toBe('https://example.com/video.mp4');
  });
});
