const BUILDINGS = {
  cursor: { name: 'Curseur', cost: 15, production: 0.1, icon: '/images/cursor-icon.png', desc: 'Produit 0.1 cookie par seconde' },
  grandma: { name: 'Grand-mère', cost: 100, production: 1, icon: '/images/grandma_icon.png', desc: 'Produit 1 cookie par seconde' },
  farm: { name: 'Ferme', cost: 1100, production: 8, icon: '/images/farm_icon.png', desc: 'Produit 8 cookies par seconde' },
  mine: { name: 'Mine', cost: 12000, production: 47, icon: '/images/mine_icon.png', desc: 'Produit 47 cookies par seconde' },
  factory: { name: 'Usine', cost: 130000, production: 260, icon: '/images/factory_icon.png', desc: 'Produit 260 cookies par seconde' },
  bank: { name: 'Banque', cost: 1400000, production: 1400, icon: '/images/bank_icon.png', desc: 'Produit 1400 cookies par seconde' },
  temple: { name: 'Temple', cost: 20000000, production: 7800, icon: '/images/temple_icon.png', desc: 'Produit 7800 cookies par seconde' }
};

const ACHIEVEMENTS = [
  { id: 'first_click', name: 'Premier pas', desc: 'Clique une fois sur le cookie', icon: '🍪', condition: (state) => state.totalCookiesEarned >= 1 },
  { id: 'cookie_fan', name: 'Fan de cookies', desc: 'Récupère 1 000 cookies au total', icon: '✨', condition: (state) => state.totalCookiesEarned >= 1000 },
  { id: 'cookie_millionaire', name: 'Millionnaire', desc: 'Récupère 1 000 000 cookies au total', icon: '💰', condition: (state) => state.totalCookiesEarned >= 1000000 },
  { id: 'click_pro', name: 'Super Cliqueur', desc: 'Améliore ton clic 5 fois', icon: '⚡', condition: (state) => state.clickUpgrades >= 5 },
  { id: 'grandma_army', name: 'Armée de mamies', desc: 'Possède 10 Grand-mères', icon: '👵', condition: (state) => state.upgrades.grandma >= 10 },
  { id: 'industrial_revolution', name: 'Révolution Industrielle', desc: 'Possède 5 Usines', icon: '🏭', condition: (state) => state.upgrades.factory >= 5 },
  { id: 'golden_luck', name: 'Coup de chance', desc: 'Active un multiplicateur doré', icon: '🌟', condition: (state) => state.multiplier > 1 }
];

function createGameState() {
  return {
    cookies: 0,
    totalCookiesEarned: 0,
    cookiesPerClick: 1,
    cookiesPerSecond: 0,
    clickUpgrades: 0,
    multiplier: 1,
    multiplierTimeLeft: 0,
    unlockedAchievements: [],
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
  
  Object.keys(BUILDINGS).forEach(id => {
    if (upgrades[id] === undefined) {
      upgrades[id] = 0;
    } else if (typeof upgrades[id] === 'object' && upgrades[id] !== null) {
      upgrades[id] = toNonNegativeNumber(upgrades[id].count, 0);
    } else {
      upgrades[id] = toNonNegativeNumber(upgrades[id], 0);
    }
  });

  let calculatedCPS = 0;
  let hasBoughtAnything = false;
  Object.keys(BUILDINGS).forEach(id => {
    const count = upgrades[id];
    if (count > 0) {
      calculatedCPS += count * BUILDINGS[id].production;
      hasBoughtAnything = true;
    }
  });

  const totalCPS = hasBoughtAnything ? calculatedCPS : toNonNegativeNumber(baseState.cookiesPerSecond, 0);

  return {
    ...baseState,
    cookies: toNonNegativeNumber(baseState.cookies, 0),
    totalCookiesEarned: toNonNegativeNumber(baseState.totalCookiesEarned, baseState.cookies || 0),
    clickUpgrades: clickUpgrades,
    upgrades: upgrades,
    unlockedAchievements: Array.isArray(baseState.unlockedAchievements) ? baseState.unlockedAchievements : [],
    cookiesPerClick: 1 + clickUpgrades,
    cookiesPerSecond: totalCPS,
    multiplier: Math.max(1, toNonNegativeNumber(baseState.multiplier, 1)),
    multiplierTimeLeft: toNonNegativeNumber(baseState.multiplierTimeLeft, 0)
  };
}

function clickCookie(state) {
  const safeState = normalizeState(state);
  const earned = safeState.cookiesPerClick * safeState.multiplier;
  return {
    ...safeState,
    cookies: safeState.cookies + earned,
    totalCookiesEarned: safeState.totalCookiesEarned + earned
  };
}

function addPassiveCookies(state, secondsElapsed) {
  const safeState = normalizeState(state);
  const earned = safeState.cookiesPerSecond * safeState.multiplier * toNonNegativeNumber(secondsElapsed, 0);
  return {
    ...safeState,
    cookies: safeState.cookies + earned,
    totalCookiesEarned: safeState.totalCookiesEarned + earned
  };
}

function buyBuilding(state, id) {
  const safeState = normalizeState(state);
  if (!BUILDINGS[id]) return safeState;
  const cost = getBuildingCost(id, safeState.upgrades[id]);
  if (safeState.cookies < cost) return safeState;
  
  const newState = {
    ...safeState,
    cookies: safeState.cookies - cost
  };
  newState.upgrades[id] += 1;
  return normalizeState(newState);
}

function buyClickUpgrade(state) {
  const safeState = normalizeState(state);
  const cost = getClickUpgradeCost(safeState.clickUpgrades);
  if (safeState.cookies < cost) return safeState;
  
  const newState = {
    ...safeState,
    cookies: safeState.cookies - cost,
    clickUpgrades: safeState.clickUpgrades + 1
  };
  return normalizeState(newState);
}

function getClickUpgradeCost(count) {
  return Math.floor(10 * Math.pow(1.5, toNonNegativeNumber(count, 0)));
}

function getBuildingCost(id, count) {
  const baseCost = BUILDINGS[id] ? BUILDINGS[id].cost : 0;
  return Math.floor(baseCost * Math.pow(1.15, toNonNegativeNumber(count, 0)));
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

const clickerApi = {
  BUILDINGS,
  ACHIEVEMENTS,
  createGameState,
  clickCookie,
  addPassiveCookies,
  buyBuilding,
  buyClickUpgrade,
  getClickUpgradeCost,
  getBuildingCost,
  getCookiesPerSecond,
  canAfford,
  spendCookies,
  normalizeState
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = clickerApi;
}

if (typeof window !== 'undefined') {
  window.Clicker = clickerApi;

  document.addEventListener('DOMContentLoaded', () => {
    const elements = {
      cookieBtn: document.getElementById('cookie-button'),
      cookieCount: document.getElementById('cookie-count'),
      cpsCount: document.getElementById('cps-count'),
      cpcCount: document.getElementById('cookies-per-click'),
      multiplierIndicator: document.getElementById('multiplier-indicator'),
      multiplierVal: document.getElementById('multiplier-value'),
      multiplierTime: document.getElementById('multiplier-time'),
      notifContainer: document.getElementById('notification-container'),
      achievementsGrid: document.getElementById('achievements-grid')
    };

    if (!elements.cookieBtn) return;

    let state = createGameState();

    const notify = (title, message, icon = '🏆') => {
      const notif = document.createElement('div');
      notif.className = 'notification';
      notif.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
          <div class="notification-title">${title}</div>
          <div class="notification-message">${message}</div>
        </div>
      `;
      elements.notifContainer.appendChild(notif);
      setTimeout(() => {
        notif.classList.add('out');
        setTimeout(() => notif.remove(), 500);
      }, 4000);
    };

    const updateAchievementsUI = () => {
      if (!elements.achievementsGrid) return;
      elements.achievementsGrid.innerHTML = ACHIEVEMENTS.map(ach => {
        const isUnlocked = state.unlockedAchievements.includes(ach.id);
        return `
          <div class="achievement-badge ${isUnlocked ? 'unlocked' : ''}">
            ${ach.icon}
            <div class="achievement-tooltip">
              <strong>${ach.name}</strong><br>${ach.desc}
            </div>
          </div>
        `;
      }).join('');
    };

    const checkAchievements = () => {
      ACHIEVEMENTS.forEach(ach => {
        if (!state.unlockedAchievements.includes(ach.id) && ach.condition(state)) {
          state.unlockedAchievements.push(ach.id);
          notify('Succès débloqué !', ach.name, ach.icon);
          updateAchievementsUI();
        }
      });
    };

    const updateUI = () => {
      elements.cookieCount.textContent = Math.floor(state.cookies).toLocaleString();
      if (elements.cpsCount) elements.cpsCount.textContent = (state.cookiesPerSecond * state.multiplier).toFixed(1).toLocaleString();
      if (elements.cpcCount) elements.cpcCount.textContent = (state.cookiesPerClick * state.multiplier).toLocaleString();

      // Multiplier
      if (state.multiplierTimeLeft > 0) {
        elements.multiplierIndicator.style.display = 'block';
        elements.multiplierVal.textContent = state.multiplier;
        elements.multiplierTime.textContent = Math.ceil(state.multiplierTimeLeft);
      } else {
        elements.multiplierIndicator.style.display = 'none';
      }

      // Temple Image
      if (state.upgrades.temple > 0) elements.cookieBtn.style.backgroundImage = "url('/images/golden.png')";

      // Upgrade Prices
      const cpcCost = Math.floor(10 * Math.pow(1.5, state.clickUpgrades));
      const cpcBtn = document.getElementById('upgrade-click');
      if (cpcBtn) {
        document.getElementById('upgrade-click-cost').textContent = cpcCost.toLocaleString();
        document.getElementById('upgrade-click-count').textContent = state.clickUpgrades;
        cpcBtn.disabled = state.cookies < cpcCost;
      }

      Object.keys(BUILDINGS).forEach(id => {
        const btn = document.getElementById(`buy-${id}`);
        const cost = Math.floor(BUILDINGS[id].cost * Math.pow(1.15, state.upgrades[id]));
        const costEl = document.getElementById(`${id}-price`);
        const countEl = document.getElementById(`${id}-count`);
        if (costEl) costEl.textContent = cost.toLocaleString();
        if (countEl) countEl.textContent = state.upgrades[id];
        if (btn) btn.disabled = state.cookies < cost;
      });
    };

    const spawnGoldenCookie = () => {
      const golden = document.createElement('div');
      golden.className = 'golden-cookie';
      golden.style.left = `${Math.random() * (window.innerWidth - 200) + 100}px`;
      golden.style.top = `${Math.random() * (window.innerHeight - 200) + 100}px`;
      golden.addEventListener('click', () => {
        state.multiplier = [2, 5, 10][Math.floor(Math.random() * 3)];
        state.multiplierTimeLeft = 15;
        golden.remove();
        checkAchievements();
        updateUI();
      });
      document.body.appendChild(golden);
      setTimeout(() => { if (golden.parentElement) golden.remove(); }, 8000);
    };

    setInterval(() => { if (Math.random() < 0.01) spawnGoldenCookie(); }, 5000);

    fetch('/users/score')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          state.cookies = data.score;
          state.totalCookiesEarned = data.totalCookiesEarned || data.score;
          state.clickUpgrades = data.clickUpgrades || 0;
          state.upgrades = data.upgrades || state.upgrades;
          state.unlockedAchievements = data.unlockedAchievements || [];
          state = normalizeState(state);
          updateUI();
          updateAchievementsUI();
        }
      });

    const saveScore = () => {
      fetch('/users/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          score: state.cookies,
          totalCookiesEarned: state.totalCookiesEarned,
          clickUpgrades: state.clickUpgrades,
          upgrades: state.upgrades,
          unlockedAchievements: state.unlockedAchievements
        })
      });
    };

    elements.cookieBtn.addEventListener('click', () => {
      state = clickCookie(state);
      checkAchievements();
      updateUI();
    });

    document.addEventListener('click', (e) => {
      const buildingBtn = e.target.closest('.buy-building');
      if (buildingBtn) {
        state = buyBuilding(state, buildingBtn.dataset.buildingId);
        checkAchievements();
        updateUI();
        saveScore();
      }
      const upgradeBtn = e.target.closest('#upgrade-click');
      if (upgradeBtn) {
        state = buyClickUpgrade(state);
        checkAchievements();
        updateUI();
        saveScore();
      }
    });

    setInterval(() => {
      let changed = false;
      if (state.cookiesPerSecond > 0) {
        const earned = (state.cookiesPerSecond * state.multiplier) / 10;
        state.cookies += earned;
        state.totalCookiesEarned += earned;
        changed = true;
      }
      if (state.multiplierTimeLeft > 0) {
        state.multiplierTimeLeft -= 0.1;
        if (state.multiplierTimeLeft <= 0) { state.multiplier = 1; state.multiplierTimeLeft = 0; }
        changed = true;
      }
      if (changed) {
        checkAchievements();
        updateUI();
      }
    }, 100);

    setInterval(saveScore, 10000);
  });
}
