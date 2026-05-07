function createGameState() {
  return {
    cookies: 0,
    cookiesPerClick: 1,
    cookiesPerSecond: 0,
    upgrades: {
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

  return {
    ...baseState,
    cookies: toNonNegativeNumber(baseState.cookies, 0),
    cookiesPerClick: toNonNegativeNumber(baseState.cookiesPerClick, 1),
    cookiesPerSecond: toNonNegativeNumber(baseState.cookiesPerSecond, 0),
    upgrades: baseState.upgrades || { grandma: 0, farm: 0, mine: 0, factory: 0, bank: 0, temple: 0 }
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

const upgradeDefinitions = {
  grandma: { basePrice: 15, production: 1, name: 'Grand-mère', desc: 'Une gentille grand-mère pour cuire des cookies.' },
  farm: { basePrice: 100, production: 8, name: 'Ferme', desc: 'Fait pousser des cookies à partir de graines de cookies.' },
  mine: { basePrice: 500, production: 47, name: 'Mine', desc: 'Extrait de la pâte à cookies des profondeurs de la terre.' },
  factory: { basePrice: 3000, production: 260, name: 'Usine', desc: 'Production massive de cookies.' },
  bank: { basePrice: 10000, production: 1400, name: 'Banque', desc: 'Génère des cookies à partir d\'intérêts.' },
  temple: { basePrice: 50000, production: 7800, name: 'Temple', desc: 'Invoque la toute-puissance des cookies.' }
};


function getCookiesPerSecond(upgrades) {
  if (!upgrades || typeof upgrades !== 'object') {
    return 0;
  }

  return Object.entries(upgrades).reduce((total, [id, data]) => {
    let count = 0;
    let rate = 0;

    if (typeof data === 'number') {
      count = toNonNegativeNumber(data, 0);
      rate = (upgradeDefinitions[id] && upgradeDefinitions[id].production) || 0;
    } else if (data && typeof data === 'object') {
      count = toNonNegativeNumber(data.count, 0);
      rate = toNonNegativeNumber(data.production, (upgradeDefinitions[id] && upgradeDefinitions[id].production) || 0);
    }

    return total + (count * rate);
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
    const cpsDisplay = document.getElementById('cps-count');

    if (!cookieButton || !cookieCount) {
      return;
    }

    let state = createGameState();

    const getPrice = (id) => {
      const def = upgradeDefinitions[id];
      const count = state.upgrades[id] || 0;
      return Math.floor(def.basePrice * Math.pow(1.10, count));
    };


    const updateUI = () => {
      cookieCount.textContent = Math.floor(state.cookies).toLocaleString();
      if (cpsDisplay) cpsDisplay.textContent = state.cookiesPerSecond.toLocaleString();

      // Golden Cookie Effect
      if (state.upgrades.temple > 0) {
        cookieButton.classList.add('golden-cookie');
      } else {
        cookieButton.classList.remove('golden-cookie');
      }

      Object.keys(upgradeDefinitions).forEach(id => {
        const btn = document.getElementById(`buy-${id}`);
        const priceSpan = document.getElementById(`${id}-price`);
        const countSpan = document.getElementById(`${id}-count`);
        
        const price = getPrice(id);
        if (priceSpan) priceSpan.textContent = price.toLocaleString();
        if (countSpan) countSpan.textContent = (state.upgrades[id] || 0).toLocaleString();
        if (btn) btn.disabled = state.cookies < price;
      });
    };

    // Fetch initial score from server
    fetch('/users/score')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          state.cookies = data.score;
          // Clean legacy upgrades if they exist and merge with new ones
          state.upgrades = { ...createGameState().upgrades, ...(data.upgrades || {}) };
          state.cookiesPerSecond = getCookiesPerSecond(state.upgrades);
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
          cookiesPerSecond: state.cookiesPerSecond,
          upgrades: state.upgrades
        })
      }).catch(err => console.error('Erreur lors de la sauvegarde du score:', err));
    };

    cookieButton.addEventListener('click', () => {
      state = clickCookie(state);
      updateUI();
    });

    // Handle upgrade purchases
    Object.keys(upgradeDefinitions).forEach(id => {
      const btn = document.getElementById(`buy-${id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          const price = getPrice(id);
          if (state.cookies >= price) {
            state.cookies -= price;
            state.upgrades[id] = (state.upgrades[id] || 0) + 1;
            state.cookiesPerSecond = getCookiesPerSecond(state.upgrades);
            updateUI();
            saveScore();
          }
        });
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
