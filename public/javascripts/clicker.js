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


    const cpsDisplay = document.getElementById('cps-count');
    const buyAutoClickerBtn = document.getElementById('buy-autoclicker');
    const autoClickerPrice = document.getElementById('autoclicker-price');


    const updateUI = () => {
      cookieCount.textContent = Math.floor(state.cookies).toLocaleString();
      if (cpsDisplay) cpsDisplay.textContent = state.cookiesPerSecond.toLocaleString();
      if (buyAutoClickerBtn && autoClickerPrice) {
        const nextPrice = Math.floor(15 * Math.pow(1.15, state.cookiesPerSecond));
        autoClickerPrice.textContent = nextPrice;
        buyAutoClickerBtn.disabled = state.cookies < nextPrice;
      }
    };

    // Fetch initial score from server
    fetch('/users/score')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          state.cookies = data.score;
          state.cookiesPerSecond = data.cookiesPerSecond || 0;
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
          cookiesPerSecond: state.cookiesPerSecond
        })
      }).catch(err => console.error('Erreur lors de la sauvegarde du score:', err));
    };

    cookieButton.addEventListener('click', () => {
      state = clickCookie(state);
      updateUI();
    });

    if (buyAutoClickerBtn) {
      buyAutoClickerBtn.addEventListener('click', () => {
        const price = Math.floor(15 * Math.pow(1.15, state.cookiesPerSecond));
        if (state.cookies >= price) {
          state.cookies -= price;
          state.cookiesPerSecond += 1;
          updateUI();
          saveScore();
        }
      });
    }

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


