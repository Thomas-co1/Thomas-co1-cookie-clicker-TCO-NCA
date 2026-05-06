function createGameState() {
  return {
    cookies: 0,
    cookiesPerClick: 1,
    cookiesPerSecond: 0
  };
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function toNonNegativeNumber(value, fallback = 0) {
  if (!isFiniteNumber(value)) {
    return fallback;
  }

  return value < 0 ? 0 : value;
}

function normalizeState(state) {
  const baseState = state && typeof state === 'object' ? state : {};

  return {
    ...baseState,
    cookies: toNonNegativeNumber(baseState.cookies, 0),
    cookiesPerClick: toNonNegativeNumber(baseState.cookiesPerClick, 1),
    cookiesPerSecond: toNonNegativeNumber(baseState.cookiesPerSecond, 0)
  };
}

function clickCookie(state) {
  const safeState = normalizeState(state);

  return {
    ...safeState,
    cookies: safeState.cookies + safeState.cookiesPerClick
  };
}

function addPassiveCookies(state, secondsElapsed) {
  const safeState = normalizeState(state);
  const safeSecondsElapsed = toNonNegativeNumber(secondsElapsed, 0);

  return {
    ...safeState,
    cookies: safeState.cookies + (safeState.cookiesPerSecond * safeSecondsElapsed)
  };
}

function canAfford(cookies, cost) {
  const safeCookies = toNonNegativeNumber(cookies, 0);
  const safeCost = toNonNegativeNumber(cost, 0);
  return safeCookies >= safeCost;
}

function spendCookies(state, cost) {
  const safeState = normalizeState(state);
  const safeCost = toNonNegativeNumber(cost, 0);

  if (!canAfford(safeState.cookies, safeCost)) {
    return safeState;
  }

  return {
    ...safeState,
    cookies: safeState.cookies - safeCost
  };
}

function getCookiesPerSecond(upgrades) {
  if (!upgrades || typeof upgrades !== 'object') {
    return 0;
  }

  return Object.values(upgrades).reduce((total, upgrade) => {
    if (!upgrade || typeof upgrade !== 'object') {
      return total;
    }

    const count = toNonNegativeNumber(upgrade.count, 0);
    const production = toNonNegativeNumber(upgrade.production, 0);

    return total + (count * production);
  }, 0);
}

const clickerApi = {
  createGameState,
  clickCookie,
  addPassiveCookies,
  canAfford,
  spendCookies,
  getCookiesPerSecond
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = clickerApi;
}

if (typeof window !== 'undefined') {
  window.Clicker = clickerApi;

  document.addEventListener('DOMContentLoaded', () => {
    const cookieButton = document.getElementById('cookie-button');
    const cookieCount = document.getElementById('cookie-count');

    if (!cookieButton || !cookieCount) {
      return;
    }

    let state = createGameState();
    cookieCount.textContent = String(state.cookies);

    cookieButton.addEventListener('click', () => {
      state = clickCookie(state);
      cookieCount.textContent = String(state.cookies);
    });
  });
}
