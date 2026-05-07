function createGameState() {
  return {
    cookies: 0,
    cookiesPerClick: 1,
    cookiesPerSecond: 0,
    clickUpgrades: 0
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
  const clickUpgrades = toNonNegativeNumber(baseState.clickUpgrades, 0);

  return {
    ...baseState,
    cookies: toNonNegativeNumber(baseState.cookies, 0),
    clickUpgrades: clickUpgrades,
    cookiesPerClick: 1 + clickUpgrades,
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

function getClickUpgradeCost(count) {
  const safeCount = toNonNegativeNumber(count, 0);
  return Math.floor(10 * Math.pow(1.5, safeCount));
}

function buyClickUpgrade(state) {
  const safeState = normalizeState(state);
  const cost = getClickUpgradeCost(safeState.clickUpgrades);

  if (!canAfford(safeState.cookies, cost)) {
    return safeState;
  }

  const newState = spendCookies(safeState, cost);
  return {
    ...newState,
    clickUpgrades: newState.clickUpgrades + 1,
    cookiesPerClick: 1 + (newState.clickUpgrades + 1)
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
  getCookiesPerSecond,
  getClickUpgradeCost,
  buyClickUpgrade
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = clickerApi;
}

if (typeof window !== 'undefined') {
  window.Clicker = clickerApi;

  document.addEventListener('DOMContentLoaded', () => {
    const cookieButton = document.getElementById('cookie-button');
    const cookieCount = document.getElementById('cookie-count');
    const upgradeClickBtn = document.getElementById('upgrade-click');
    const upgradeClickCost = document.getElementById('upgrade-click-cost');
    const upgradeClickCount = document.getElementById('upgrade-click-count');
    const cookiesPerClickDisplay = document.getElementById('cookies-per-click');

    if (!cookieButton || !cookieCount) {
      return;
    }

    let state = createGameState();

    const updateUI = () => {
      cookieCount.textContent = Math.floor(state.cookies).toLocaleString();
      
      if (upgradeClickCost) {
        const cost = getClickUpgradeCost(state.clickUpgrades);
        upgradeClickCost.textContent = cost.toLocaleString();
        
        if (upgradeClickBtn) {
          upgradeClickBtn.disabled = !canAfford(state.cookies, cost);
        }
      }
      
      if (upgradeClickCount) {
        upgradeClickCount.textContent = state.clickUpgrades;
      }
      
      if (cookiesPerClickDisplay) {
        cookiesPerClickDisplay.textContent = state.cookiesPerClick;
      }
    };

    // Fetch initial score from server
    fetch('/users/score')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          state.cookies = data.score;
          state.clickUpgrades = data.clickUpgrades || 0;
          state = normalizeState(state);
          updateUI();
        }
      })
      .catch(err => console.error('Erreur lors du chargement du score:', err));

    updateUI();

    const saveScore = () => {
      fetch('/users/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          score: state.cookies,
          clickUpgrades: state.clickUpgrades
        })
      }).catch(err => console.error('Erreur lors de la sauvegarde du score:', err));
    };

    cookieButton.addEventListener('click', () => {
      state = clickCookie(state);
      updateUI();
    });

    if (upgradeClickBtn) {
      upgradeClickBtn.addEventListener('click', () => {
        state = buyClickUpgrade(state);
        updateUI();
      });
    }

    // Periodically save score every 5 seconds
    setInterval(saveScore, 5000);

    // Also save on page unload
    window.addEventListener('beforeunload', saveScore);
  });
}

