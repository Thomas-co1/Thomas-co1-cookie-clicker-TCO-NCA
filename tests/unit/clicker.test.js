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
});
