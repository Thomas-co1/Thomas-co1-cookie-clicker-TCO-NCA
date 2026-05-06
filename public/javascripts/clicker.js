function createGameState() {
  return {
    cookies: 0,
    cookiesPerClick: 1,
    cookiesPerSecond: 0
  };
}

function clickCookie(state) {
  return {
    ...state,
    cookies: state.cookies + state.cookiesPerClick
  };
}

function addPassiveCookies(state, secondsElapsed) {
  return {
    ...state,
    cookies: state.cookies + (state.cookiesPerSecond * secondsElapsed)
  };
}

function canAfford(cookies, cost) {
  return cookies >= cost;
}

function spendCookies(state, cost) {
  if (!canAfford(state.cookies, cost)) {
    return state;
  }

  return {
    ...state,
    cookies: state.cookies - cost
  };
}

function getCookiesPerSecond(upgrades) {
  return Object.values(upgrades).reduce((total, upgrade) => {
    return total + (upgrade.count * upgrade.production);
  }, 0);
}

module.exports = {
  createGameState,
  clickCookie,
  addPassiveCookies,
  canAfford,
  spendCookies,
  getCookiesPerSecond
};
