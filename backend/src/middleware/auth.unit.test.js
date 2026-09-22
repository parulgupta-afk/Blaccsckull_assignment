const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-for-unit-tests-only';

const { requireAuth, optionalAuth } = require('./auth');

function mockRes() {
  return {};
}

describe('requireAuth', () => {
  it('calls next() with no error and attaches req.user for a valid token', () => {
    const token = jwt.sign({ sub: 'user-1' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    requireAuth(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(); // called with no error argument
    expect(req.user).toEqual({ id: 'user-1' });
  });

  it('calls next(err) with a 401 ApiError when no Authorization header is present', () => {
    const req = { headers: {} };
    const next = jest.fn();

    requireAuth(req, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  it('calls next(err) with a 401 ApiError for a token signed with the wrong secret', () => {
    const badToken = jwt.sign({ sub: 'user-1' }, 'wrong-secret');
    const req = { headers: { authorization: `Bearer ${badToken}` } };
    const next = jest.fn();

    requireAuth(req, mockRes(), next);

    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });

  it('rejects a malformed Authorization header (missing "Bearer" scheme)', () => {
    const token = jwt.sign({ sub: 'user-1' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: token } }; // no "Bearer " prefix
    const next = jest.fn();

    requireAuth(req, mockRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });
});

describe('optionalAuth', () => {
  it('attaches req.user for a valid token and still calls next() with no error', () => {
    const token = jwt.sign({ sub: 'user-2' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    optionalAuth(req, mockRes(), next);

    expect(req.user).toEqual({ id: 'user-2' });
    expect(next).toHaveBeenCalledWith();
  });

  it('sets req.user to null (not an error) when no token is present, allowing guest access', () => {
    const req = { headers: {} };
    const next = jest.fn();

    optionalAuth(req, mockRes(), next);

    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalledWith(); // no error -- guests are allowed through
  });
});
