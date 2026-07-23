(function () {
  const SESSION_KEY = 'calista-intro-played';

  const boardEl = document.getElementById('board');
  const messageEl = document.getElementById('intro-message');
  const skipBtn = document.getElementById('skip-btn');
  const overlayEl = document.getElementById('intro-overlay');

  if (!boardEl) return;

  const navEntry = performance.getEntriesByType('navigation')[0];
  const isReload = navEntry && navEntry.type === 'reload';

  if (!isReload && sessionStorage.getItem(SESSION_KEY)) {
    overlayEl.classList.add('hidden');
    return;
  }

  const size = window.matchMedia('(max-width: 480px)').matches ? 6 : 8;
  const starCount = size === 6 ? 7 : 10;

  function dissolve() {
    overlayEl.classList.add('dissolve');
    setTimeout(() => overlayEl.classList.add('hidden'), 700);
  }

  Minesweeper.create(boardEl, {
    size,
    starCount,
    onExplode: () => {
      sessionStorage.setItem(SESSION_KEY, 'true');
      messageEl.textContent = 'oh no, star down!';
      setTimeout(dissolve, 900);
    },
    onWin: (rippleMs) => {
      sessionStorage.setItem(SESSION_KEY, 'true');
      messageEl.textContent = '✦ found them all!';
      setTimeout(dissolve, rippleMs);
    },
  });

  skipBtn.addEventListener('click', () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    dissolve();
  });
})();
