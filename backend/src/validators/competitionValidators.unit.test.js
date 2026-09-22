const { registerSchema, submitSchema } = require('./competitionValidators');

describe('registerSchema', () => {
  it('accepts an empty body (paymentReference optional)', () => {
    expect(registerSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a valid paymentReference string', () => {
    const result = registerSchema.safeParse({ paymentReference: 'pay_123' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty-string paymentReference', () => {
    const result = registerSchema.safeParse({ paymentReference: '' });
    expect(result.success).toBe(false);
  });
});

describe('submitSchema', () => {
  it('accepts a valid https media URL', () => {
    const result = submitSchema.safeParse({ mediaUrl: 'https://example.com/video.mp4' });
    expect(result.success).toBe(true);
  });

  it('rejects a missing mediaUrl', () => {
    expect(submitSchema.safeParse({}).success).toBe(false);
  });

  it('rejects a non-URL string', () => {
    const result = submitSchema.safeParse({ mediaUrl: 'not-a-url' });
    expect(result.success).toBe(false);
  });
});
