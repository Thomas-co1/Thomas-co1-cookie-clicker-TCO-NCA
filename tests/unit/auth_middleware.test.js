import { describe, it, expect, vi } from 'vitest';
import authMiddleware from '../../middleware/auth';

describe('Auth Middleware', () => {
  it('should set res.locals.user to null if no session', () => {
    const req = {};
    const res = { locals: {} };
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.locals.user).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  it('should set res.locals.user if session exists', () => {
    const req = {
      session: {
        userId: 1,
        username: 'testuser'
      }
    };
    const res = { locals: {} };
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.locals.user).toEqual({ id: 1, username: 'testuser' });
    expect(next).toHaveBeenCalled();
  });
});
