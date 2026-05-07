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
    multiplier: 1,
    multiplierTimeLeft: 0,
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
  
  // Always ensure all buildings exist in the upgrades object
  Object.keys(BUILDINGS).forEach(id => {
    if (upgrades[id] === undefined) {
      upgrades[id] = 0;
    } else if (typeof upgrades[id] === 'object' && upgrades[id] !== null) {
      // Handle old format from tests if necessary
      upgrades[id] = toNonNegativeNumber(upgrades[id].count, 0);
    } else {
      upgrades[id] = toNonNegativeNumber(upgrades[id], 0);
    }
  });

  // Calculate total CPS from upgrades
  let calculatedCPS = 0;
  let hasBoughtAnything = false;

  Object.keys(BUILDINGS).forEach(id => {
    const count = upgrades[id];
    if (count > 0) {
      calculatedCPS += count * BUILDINGS[id].production;
      hasBoughtAnything = true;
    }
  });

  // If no buildings have been bought, respect the manually set cookiesPerSecond (for tests/migration)
  const totalCPS = hasBoughtAnything ? calculatedCPS : toNonNegativeNumber(baseState.cookiesPerSecond, 0);

  return {
    ...baseState,
    cookies: toNonNegativeNumber(baseState.cookies, 0),
    clickUpgrades: clickUpgrades,
    upgrades: upgrades,
    cookiesPerClick: 1 + clickUpgrades,
    cookiesPerSecond: totalCPS,
    multiplier: Math.max(1, toNonNegativeNumber(baseState.multiplier, 1)),
    multiplierTimeLeft: toNonNegativeNumber(baseState.multiplierTimeLeft, 0)
  };
}

function clickCookie(state) {
  const safeState = normalizeState(state);
  return {
    ...safeState,
    cookies: safeState.cookies + (safeState.cookiesPerClick * safeState.multiplier)
  };
}

function addPassiveCookies(state, secondsElapsed) {
  const safeState = normalizeState(state);
  const safeSecondsElapsed = toNonNegativeNumber(secondsElapsed, 0);
  return {
    ...safeState,
    cookies: safeState.cookies + (safeState.cookiesPerSecond * safeState.multiplier * safeSecondsElapsed)
  };
}

function canAfford(cookies, cost) {
  return toNonNegativeNumber(cookies, 0) >= toNonNegativeNumber(cost, 0);
}

function spendCookies(state, cost) {
  const safeState = normalizeState(state);
  const safeCost = toNonNegativeNumber(cost, 0);
  if (!canAfford(safeState.cookies, safeCost)) return safeState;
  return {
    ...safeState,
    cookies: safeState.cookies - safeCost
  };
}

function getClickUpgradeCost(count) {
  return Math.floor(10 * Math.pow(1.5, toNonNegativeNumber(count, 0)));
}

function getBuildingCost(id, count) {
  const baseCost = BUILDINGS[id] ? BUILDINGS[id].cost : 0;
  const safeCount = toNonNegativeNumber(count, 0);
  return Math.floor(baseCost * Math.pow(1.15, safeCount));
}

function buyClickUpgrade(state) {
  const safeState = normalizeState(state);
  const cost = getClickUpgradeCost(safeState.clickUpgrades);
  if (!canAfford(safeState.cookies, cost)) return safeState;
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
  if (!canAfford(safeState.cookies, cost)) return safeState;
  const newState = spendCookies(safeState, cost);
  newState.upgrades[id] += 1;
  return normalizeState(newState); // Re-calculate CPS
}

function getCookiesPerSecond(upgrades) {
  if (!upgrades || typeof upgrades !== 'object') return 0;
  return Object.keys(upgrades).reduce((total, id) => {
    const entry = upgrades[id];
    if (!entry) return total;
    if (typeof entry === 'object') {
      return total + (toNonNegativeNumber(entry.count, 0) * toNonNegativeNumber(entry.production, 0));
    }
    const production = BUILDINGS[id] ? BUILDINGS[id].production : 0;
    return total + (toNonNegativeNumber(entry, 0) * production);
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
    const multiplierIndicator = document.getElementById('multiplier-indicator');
    const multiplierValue = document.getElementById('multiplier-value');
    const multiplierTime = document.getElementById('multiplier-time');

    if (!cookieButton || !cookieCount) return;

    let state = createGameState();

    const updateUI = () => {
      cookieCount.textContent = Math.floor(state.cookies).toLocaleString();
      if (cpsDisplay) cpsDisplay.textContent = (state.cookiesPerSecond * state.multiplier).toFixed(1).toLocaleString();
      if (cookiesPerClickDisplay) cookiesPerClickDisplay.textContent = state.cookiesPerClick * state.multiplier;

      // Temple milestone image swap
      if (state.upgrades.temple > 0) {
        cookieButton.style.backgroundImage = "url('/images/golden.png')";
      } else {
        cookieButton.style.backgroundImage = ""; 
      }

      // Multiplier UI
      if (state.multiplierTimeLeft > 0) {
        multiplierIndicator.style.display = 'block';
        multiplierValue.textContent = state.multiplier;
        multiplierTime.textContent = Math.ceil(state.multiplierTimeLeft);
      } else {
        multiplierIndicator.style.display = 'none';
      }

      // Click Upgrade UI
      const upgradeClickBtn = document.getElementById('upgrade-click');
      const upgradeClickCost = document.getElementById('upgrade-click-cost');
      const upgradeClickCount = document.getElementById('upgrade-click-count');
      if (upgradeClickCost) {
        const cost = getClickUpgradeCost(state.clickUpgrades);
        upgradeClickCost.textContent = cost.toLocaleString();
        if (upgradeClickBtn) upgradeClickBtn.disabled = !canAfford(state.cookies, cost);
      }
      if (upgradeClickCount) upgradeClickCount.textContent = state.clickUpgrades;

      // Buildings UI
      Object.keys(BUILDINGS).forEach(id => {
        const btn = document.getElementById(`buy-${id}`);
        const costEl = document.getElementById(`${id}-price`);
        const countEl = document.getElementById(`${id}-count`);
        if (costEl) {
          const cost = getBuildingCost(id, state.upgrades[id]);
          costEl.textContent = cost.toLocaleString();
          if (btn) btn.disabled = !canAfford(state.cookies, cost);
        }
        if (countEl) countEl.textContent = state.upgrades[id];
      });
    };

    const spawnGoldenCookie = () => {
      const golden = document.createElement('div');
      golden.className = 'golden-cookie';
      const x = Math.random() * (window.innerWidth - 200) + 100;
      const y = Math.random() * (window.innerHeight - 200) + 100;
      golden.style.left = `${x}px`;
      golden.style.top = `${y}px`;
      golden.addEventListener('click', () => {
        const factors = [2, 5, 7, 10];
        state.multiplier = factors[Math.floor(Math.random() * factors.length)];
        state.multiplierTimeLeft = 15;
        golden.remove();
        updateUI();
      });
      document.body.appendChild(golden);
      setTimeout(() => { if (golden.parentElement) { golden.style.opacity = '0'; setTimeout(() => golden.remove(), 500); } }, 10000);
    };

    const scheduleNextGolden = () => {
      setTimeout(() => { spawnGoldenCookie(); scheduleNextGolden(); }, Math.random() * 60000 + 30000);
    };
    scheduleNextGolden();

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
      .catch(err => console.error('Erreur score:', err));

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
      }).catch(err => console.error('Erreur sauvegarde:', err));
    };

    cookieButton.addEventListener('click', () => { state = clickCookie(state); updateUI(); });

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.buy-building');
      if (btn) {
        state = buyBuilding(state, btn.dataset.buildingId);
        updateUI();
        saveScore();
      }
      const clickBtn = e.target.closest('#upgrade-click');
      if (clickBtn) {
        state = buyClickUpgrade(state);
        updateUI();
        saveScore();
      }
    });

    setInterval(() => {
      let changed = false;
      if (state.cookiesPerSecond > 0) { state.cookies += (state.cookiesPerSecond * state.multiplier) / 10; changed = true; }
      if (state.multiplierTimeLeft > 0) {
        state.multiplierTimeLeft -= 0.1;
        if (state.multiplierTimeLeft <= 0) { state.multiplier = 1; state.multiplierTimeLeft = 0; }
        changed = true;
      }
      if (changed) updateUI();
    }, 100);

    setInterval(saveScore, 10000);
    window.addEventListener('beforeunload', saveScore);
    updateUI();
  });
}
