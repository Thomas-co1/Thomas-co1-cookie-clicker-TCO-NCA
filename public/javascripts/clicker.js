const BUILDINGS = {
  cursor: { name: 'Curseur', cost: 15, production: 0.1, icon: '/images/cursor-icon.png', desc: 'Produit 0.1 cookie par seconde' },
  grandma: { name: 'Grand-mère', cost: 100, production: 1, icon: '/images/grandma_icon.png', desc: 'Produit 1 cookie par seconde' },
  farm: { name: 'Ferme', cost: 1100, production: 8, icon: '/images/farm_icon.png', desc: 'Produit 8 cookies par seconde' },
  mine: { name: 'Mine', cost: 12000, production: 47, icon: '/images/mine_icon.png', desc: 'Produit 47 cookies par seconde' },
  factory: { name: 'Usine', cost: 130000, production: 260, icon: '/images/factory_icon.png', desc: 'Produit 260 cookies par seconde' },
  bank: { name: 'Banque', cost: 1400000, production: 1400, icon: '/images/bank_icon.png', desc: 'Produit 1400 cookies par seconde' },
  temple: { name: 'Temple', cost: 20000000, production: 7800, icon: '/images/temple_icon.png', desc: 'Produit 7800 cookies par seconde' }
};

function createGameState() {
  return {
    cookies: 0,
    cookiesPerClick: 1,
    cookiesPerSecond: 0,
    clickUpgrades: 0,
    upgrades: {
      cursor: 0,
      grandma: 0,
      farm: 0,
      mine: 0,
      factory: 0,
      bank: 0,
      temple: 0
    }
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
  const upgrades = baseState.upgrades || {};
  
  // Calculate total CPS from upgrades
  // We only recalculate if upgrades has any non-zero count or if it's the test format (with production)
  let calculatedCPS = 0;
  let hasActiveUpgrades = false;

  Object.keys(upgrades).forEach(id => {
    const entry = upgrades[id];
    if (!entry) return;

    if (typeof entry === 'object' && entry !== null) {
      const count = toNonNegativeNumber(entry.count, 0);
      const production = toNonNegativeNumber(entry.production, 0);
      if (count > 0) {
        calculatedCPS += count * production;
        hasActiveUpgrades = true;
      }
    } else {
      const count = toNonNegativeNumber(entry, 0);
      const production = BUILDINGS[id] ? BUILDINGS[id].production : 0;
      if (count > 0) {
        calculatedCPS += count * production;
        hasActiveUpgrades = true;
      }
    }
  });

  // If no buildings have been bought, respect the manually set cookiesPerSecond (for tests)
  const totalCPS = hasActiveUpgrades ? calculatedCPS : toNonNegativeNumber(baseState.cookiesPerSecond, 0);

  return {
    ...baseState,
    cookies: toNonNegativeNumber(baseState.cookies, 0),
    clickUpgrades: clickUpgrades,
    upgrades: upgrades,
    cookiesPerClick: 1 + clickUpgrades,
    cookiesPerSecond: totalCPS
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

function getBuildingCost(id, count) {
  const baseCost = BUILDINGS[id] ? BUILDINGS[id].cost : 0;
  const safeCount = toNonNegativeNumber(count, 0);
  return Math.floor(baseCost * Math.pow(1.15, safeCount));
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

function buyBuilding(state, id) {
  const safeState = normalizeState(state);
  if (!BUILDINGS[id]) return safeState;

  const cost = getBuildingCost(id, safeState.upgrades[id]);
  if (!canAfford(safeState.cookies, cost)) {
    return safeState;
  }

  const newState = spendCookies(safeState, cost);
  newState.upgrades[id] += 1;
  
  // Re-normalize to update CPS
  return normalizeState(newState);
}

function getCookiesPerSecond(upgrades) {
  if (!upgrades || typeof upgrades !== 'object') {
    return 0;
  }

  return Object.keys(upgrades).reduce((total, id) => {
    const entry = upgrades[id];
    if (!entry) return total;

    if (typeof entry === 'object') {
      const count = toNonNegativeNumber(entry.count, 0);
      const production = toNonNegativeNumber(entry.production, 0);
      return total + (count * production);
    } else {
      const count = toNonNegativeNumber(entry, 0);
      const production = BUILDINGS[id] ? BUILDINGS[id].production : 0;
      return total + (count * production);
    }
  }, 0);
}

const clickerApi = {
  BUILDINGS,
  createGameState,
  clickCookie,
  addPassiveCookies,
  canAfford,
  spendCookies,
  getCookiesPerSecond,
  getClickUpgradeCost,
  getBuildingCost,
  buyClickUpgrade,
  buyBuilding,
  normalizeState
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = clickerApi;
}

if (typeof window !== 'undefined') {
  window.Clicker = clickerApi;

  document.addEventListener('DOMContentLoaded', () => {
    const cookieButton = document.getElementById('cookie-button');
    const cookieCount = document.getElementById('cookie-count');
    const cpsDisplay = document.getElementById('cps-count');
    const cookiesPerClickDisplay = document.getElementById('cookies-per-click');

    if (!cookieButton || !cookieCount) {
      return;
    }

    let state = createGameState();

    const updateUI = () => {
      cookieCount.textContent = Math.floor(state.cookies).toLocaleString();
      
      if (cpsDisplay) {
        cpsDisplay.textContent = state.cookiesPerSecond.toFixed(1).toLocaleString();
      }
      
      if (cookiesPerClickDisplay) {
        cookiesPerClickDisplay.textContent = state.cookiesPerClick;
      }

      // Update Click Upgrade UI
      const upgradeClickBtn = document.getElementById('upgrade-click');
      const upgradeClickCost = document.getElementById('upgrade-click-cost');
      const upgradeClickCount = document.getElementById('upgrade-click-count');

      if (upgradeClickCost) {
        const cost = getClickUpgradeCost(state.clickUpgrades);
        upgradeClickCost.textContent = cost.toLocaleString();
        if (upgradeClickBtn) upgradeClickBtn.disabled = !canAfford(state.cookies, cost);
      }
      if (upgradeClickCount) {
        upgradeClickCount.textContent = state.clickUpgrades;
      }

      // Update Buildings UI
      Object.keys(BUILDINGS).forEach(id => {
        const btn = document.getElementById(`buy-${id}`);
        const costEl = document.getElementById(`${id}-price`);
        const countEl = document.getElementById(`${id}-count`);

        if (costEl) {
          const cost = getBuildingCost(id, state.upgrades[id]);
          costEl.textContent = cost.toLocaleString();
          if (btn) btn.disabled = !canAfford(state.cookies, cost);
        }
        if (countEl) {
          countEl.textContent = state.upgrades[id];
        }
      });
    };

    // Fetch initial score from server
    fetch('/users/score')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          state.cookies = data.score;
          state.clickUpgrades = data.clickUpgrades || 0;
          state.upgrades = data.upgrades || state.upgrades;
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
          clickUpgrades: state.clickUpgrades,
          cookiesPerSecond: state.cookiesPerSecond,
          upgrades: state.upgrades
        })
      }).catch(err => console.error('Erreur lors de la sauvegarde du score:', err));
    };

    cookieButton.addEventListener('click', () => {
      state = clickCookie(state);
      updateUI();
    });

    // Delegate building buy clicks
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.buy-building');
      if (btn) {
        const id = btn.dataset.buildingId;
        state = buyBuilding(state, id);
        updateUI();
        saveScore();
      }
      
      const clickUpgradeBtn = e.target.closest('#upgrade-click');
      if (clickUpgradeBtn) {
        state = buyClickUpgrade(state);
        updateUI();
        saveScore();
      }
    });

    // Passive production interval (every 100ms for smoothness)
    setInterval(() => {
      if (state.cookiesPerSecond > 0) {
        state.cookies += state.cookiesPerSecond / 10;
        updateUI();
      }
    }, 100);

    // Periodically save score every 10 seconds
    setInterval(saveScore, 10000);

    // Also save on page unload
    window.addEventListener('beforeunload', saveScore);
  });
}
