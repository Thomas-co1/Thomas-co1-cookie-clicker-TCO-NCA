import { describe, it, expect } from 'vitest';
import clicker from '../../public/javascripts/clicker.js';

const {
  createGameState,
  clickCookie,
  addPassiveCookies,
  canAfford,
  spendCookies,
  getCookiesPerSecond
} = clicker;

describe('Clicker logic', () => {
  describe('normal cases', () => {
  it('creates an initial game state', () => {
    const state = createGameState();

    expect(state.cookies).toBe(0);
    expect(state.cookiesPerClick).toBe(1);
    expect(state.cookiesPerSecond).toBe(0);
  });

  it('increments cookies when clicking', () => {
    const state = createGameState();

    const nextState = clickCookie(state);

    expect(nextState.cookies).toBe(1);
  });

  it('applies passive cookies over time', () => {
    const state = {
      ...createGameState(),
      cookiesPerSecond: 2,
      cookies: 10
    };

    const nextState = addPassiveCookies(state, 3);

    expect(nextState.cookies).toBe(16);
  });

  it('checks affordability correctly', () => {
    expect(canAfford(100, 40)).toBe(true);
    expect(canAfford(39, 40)).toBe(false);
  });

  it('spends cookies when purchase is possible', () => {
    const state = {
      ...createGameState(),
      cookies: 120
    };

    const nextState = spendCookies(state, 45);

    expect(nextState.cookies).toBe(75);
  });

  it('does not create negative cookies on spend', () => {
    const state = {
      ...createGameState(),
      cookies: 20
    };

    const nextState = spendCookies(state, 50);

    expect(nextState.cookies).toBe(20);
  });

  it('computes total cps from upgrades', () => {
    const upgrades = {
      cursor: { count: 2, production: 0.1 },
      grandma: { count: 3, production: 1 }
    };

    expect(getCookiesPerSecond(upgrades)).toBeCloseTo(3.2);
  });

  it('returns true when cookies equal exact cost', () => {
    expect(canAfford(40, 40)).toBe(true);
  });
  });

  describe('error cases', () => {
    it('handles undefined state on click', () => {
      const nextState = clickCookie(undefined);

      expect(nextState.cookies).toBe(1);
      expect(nextState.cookiesPerClick).toBe(1);
    });

    it('handles invalid numeric values on click', () => {
      const nextState = clickCookie({
        cookies: 'abc',
        cookiesPerClick: NaN
      });

      expect(nextState.cookies).toBe(1);
    });

    it('returns false for invalid affordability input', () => {
      expect(canAfford(undefined, 10)).toBe(false);
      expect(canAfford(10, undefined)).toBe(true);
    });

    it('ignores invalid upgrade entries for cps computation', () => {
      const upgrades = {
        ok: { count: 2, production: 0.5 },
        broken1: null,
        broken2: { count: 'x', production: 10 },
        broken3: { count: 2, production: undefined }
      };

      expect(getCookiesPerSecond(upgrades)).toBe(1);
    });

    it('returns 0 cps for invalid upgrades object', () => {
      expect(getCookiesPerSecond(undefined)).toBe(0);
      expect(getCookiesPerSecond(null)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('does not add passive cookies for negative elapsed time', () => {
      const state = {
        ...createGameState(),
        cookies: 10,
        cookiesPerSecond: 5
      };

      const nextState = addPassiveCookies(state, -3);

      expect(nextState.cookies).toBe(10);
    });

    it('does not mutate original state object on click', () => {
      const state = createGameState();

      const nextState = clickCookie(state);

      expect(state.cookies).toBe(0);
      expect(nextState).not.toBe(state);
    });

    it('treats negative cost as zero on spend', () => {
      const state = {
        ...createGameState(),
        cookies: 12
      };

      const nextState = spendCookies(state, -50);

      expect(nextState.cookies).toBe(12);
    });

    it('normalizes negative state values during spend', () => {
      const state = {
        cookies: -100,
        cookiesPerClick: -3,
        cookiesPerSecond: -2
      };

      const nextState = spendCookies(state, 1);

      expect(nextState.cookies).toBe(0);
      expect(nextState.cookiesPerClick).toBe(0);
      expect(nextState.cookiesPerSecond).toBe(0);
    });

    it('returns 0 cps for empty upgrades object', () => {
      expect(getCookiesPerSecond({})).toBe(0);
    });

    it('keeps decimal precision in passive generation', () => {
      const state = {
        ...createGameState(),
        cookies: 1,
        cookiesPerSecond: 0.1
      };

      const nextState = addPassiveCookies(state, 5);

      expect(nextState.cookies).toBeCloseTo(1.5);
    });
  });
});
