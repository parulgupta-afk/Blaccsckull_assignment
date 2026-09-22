const Competition = require('./Competition');

// computeLifecycle is intentionally a pure function of (document fields, now)
// with no DB calls, so it can be constructed and tested without connecting
// to MongoDB at all -- these run anywhere, including CI with no DB service.
function buildCompetition(overrides = {}) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  return new Competition({
    title: 'Test Competition',
    prizePool: 1000,
    entryFee: 50,
    maxParticipants: 20,
    confirmedParticipants: 0,
    registrationDeadline: new Date(now + 1 * day),
    submissionStartsAt: new Date(now + 2 * day),
    submissionEndsAt: new Date(now + 5 * day),
    resultDate: new Date(now + 7 * day),
    judge: {
      name: 'Judge Name',
      title: { en: 'Judge Title' },
      experienceLabel: { en: '5+ years' },
      photoUrl: 'https://example.com/judge.jpg',
    },
    tabContent: {
      about: { en: 'About' },
      judgingParameters: { en: 'Params' },
      rulesAndEligibility: { en: 'Rules' },
    },
    adminStatus: 'published',
    ...overrides,
  });
}

describe('Competition.computeLifecycle', () => {
  it('is registration_open when now is before the deadline and spots remain', () => {
    const c = buildCompetition();
    const lifecycle = c.computeLifecycle(new Date());
    expect(lifecycle.phase).toBe('registration_open');
    expect(lifecycle.registrationOpen).toBe(true);
    expect(lifecycle.spotsLeft).toBe(20);
    expect(lifecycle.isFull).toBe(false);
  });

  it('is registration_closed once the deadline has passed but submissions have not started', () => {
    const c = buildCompetition();
    const afterDeadline = new Date(c.registrationDeadline.getTime() + 1000);
    const lifecycle = c.computeLifecycle(afterDeadline);
    expect(lifecycle.phase).toBe('registration_closed');
    expect(lifecycle.registrationOpen).toBe(false);
    expect(lifecycle.submissionOpen).toBe(false);
  });

  it('is registration_closed (full) when capacity is reached even before the deadline', () => {
    const c = buildCompetition({ maxParticipants: 5, confirmedParticipants: 5 });
    const lifecycle = c.computeLifecycle(new Date());
    expect(lifecycle.isFull).toBe(true);
    expect(lifecycle.spotsLeft).toBe(0);
    expect(lifecycle.registrationOpen).toBe(false);
    expect(lifecycle.phase).toBe('registration_closed');
  });

  it('is submission_open between submissionStartsAt and submissionEndsAt', () => {
    const c = buildCompetition();
    const duringSubmission = new Date(c.submissionStartsAt.getTime() + 1000);
    const lifecycle = c.computeLifecycle(duringSubmission);
    expect(lifecycle.phase).toBe('submission_open');
    expect(lifecycle.submissionOpen).toBe(true);
    expect(lifecycle.registrationOpen).toBe(false); // deadline already passed by this point in the fixture
  });

  it('is judging between submissionEndsAt and resultDate', () => {
    const c = buildCompetition();
    const duringJudging = new Date(c.submissionEndsAt.getTime() + 1000);
    const lifecycle = c.computeLifecycle(duringJudging);
    expect(lifecycle.phase).toBe('judging');
    expect(lifecycle.submissionOpen).toBe(false);
  });

  it('is completed at/after resultDate', () => {
    const c = buildCompetition();
    const afterResults = new Date(c.resultDate.getTime() + 1000);
    const lifecycle = c.computeLifecycle(afterResults);
    expect(lifecycle.phase).toBe('completed');
  });

  it('never reports spotsLeft below zero even if confirmedParticipants exceeds max (defensive)', () => {
    const c = buildCompetition({ maxParticipants: 5, confirmedParticipants: 9 });
    const lifecycle = c.computeLifecycle(new Date());
    expect(lifecycle.spotsLeft).toBe(0);
    expect(lifecycle.isFull).toBe(true);
  });

  it('is unpublished when adminStatus is not "published", regardless of dates', () => {
    const c = buildCompetition({ adminStatus: 'draft' });
    const lifecycle = c.computeLifecycle(new Date());
    expect(lifecycle.phase).toBe('unpublished');
    expect(lifecycle.registrationOpen).toBe(false);
  });
});
