(function () {
  const SIZE = 8;
  const STAR_COUNT = 10;
  const SESSION_KEY = 'calista-intro-played';
  const STAR_PATH = "M58.33,2.73 L65.82,34.72 L97.53,43.32 L69.42,60.33 L71.04,93.14 L46.18,71.67 L15.47,83.35 L28.21,53.06 L7.62,27.46 L40.36,30.23 Z";

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

  let cells = [];
  let revealedCount = 0;
  let gameOver = false;

  function buildBoard() {
    cells = Array.from({ length: SIZE * SIZE }, () => ({
      star: false,
      revealed: false,
      flagged: false,
      count: 0,
    }));

    let placed = 0;
    while (placed < STAR_COUNT) {
      const i = Math.floor(Math.random() * cells.length);
      if (!cells[i].star) {
        cells[i].star = true;
        placed++;
      }
    }

    for (let i = 0; i < cells.length; i++) {
      if (cells[i].star) continue;
      cells[i].count = neighbors(i).filter((n) => cells[n].star).length;
    }
  }

  function neighbors(i) {
    const row = Math.floor(i / SIZE);
    const col = i % SIZE;
    const result = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
          result.push(r * SIZE + c);
        }
      }
    }
    return result;
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    cells.forEach((cell, i) => {
      const btn = document.createElement('button');
      btn.className = 'tile';
      btn.type = 'button';

      let clickTimer = null;
      btn.addEventListener('click', () => {
        if (clickTimer) return;
        clickTimer = setTimeout(() => {
          clickTimer = null;
          handleClick(i);
        }, 220);
      });
      btn.addEventListener('dblclick', () => {
        clearTimeout(clickTimer);
        clickTimer = null;
        toggleFlag(i);
      });

      boardEl.appendChild(btn);
    });
  }

  function handleClick(i) {
    if (gameOver) return;
    if (cells[i].flagged) return;
    if (cells[i].star) {
      explode(i);
      return;
    }
    reveal(i);
    checkWin();
  }

  function toggleFlag(i) {
    if (gameOver) return;
    const cell = cells[i];
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
    boardEl.children[i].classList.toggle('flagged', cell.flagged);
  }

  function starSvg() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="${STAR_PATH}"/></svg>`;
  }

  function reveal(i) {
    const cell = cells[i];
    if (cell.revealed || cell.flagged) return;
    cell.revealed = true;
    revealedCount++;

    const btn = boardEl.children[i];
    btn.classList.add('revealed');

    if (cell.count > 0) {
      btn.textContent = cell.count;
    } else {
      neighbors(i).forEach((n) => reveal(n));
    }
  }

  function explode(i) {
    gameOver = true;
    sessionStorage.setItem(SESSION_KEY, 'true');
    const btn = boardEl.children[i];
    btn.classList.add('revealed', 'star', 'exploding');
    btn.innerHTML = starSvg();
    messageEl.textContent = '✦ boom! ✦';
    setTimeout(dissolve, 650);
  }

  function checkWin() {
    const safeCells = cells.length - STAR_COUNT;
    if (revealedCount >= safeCells && !gameOver) {
      rippleWin();
    }
  }

  function rippleWin() {
    gameOver = true;
    sessionStorage.setItem(SESSION_KEY, 'true');
    messageEl.textContent = '✦ found them all!';

    const RIPPLE_TOTAL_MS = 1500;
    const VANISH_MS = 350;
    const center = (SIZE - 1) / 2;
    const maxDist = Math.hypot(center, center);

    Array.from(boardEl.children).forEach((tile, i) => {
      const row = Math.floor(i / SIZE);
      const col = i % SIZE;
      const dist = Math.hypot(row - center, col - center);
      const delay = (dist / maxDist) * (RIPPLE_TOTAL_MS - VANISH_MS);
      tile.style.transition = `opacity ${VANISH_MS}ms ease ${delay}ms, transform ${VANISH_MS}ms ease ${delay}ms`;
      tile.classList.add('vanish');
    });

    setTimeout(dissolve, RIPPLE_TOTAL_MS);
  }

  function dissolve() {
    overlayEl.classList.add('dissolve');
    setTimeout(() => overlayEl.classList.add('hidden'), 700);
  }

  skipBtn.addEventListener('click', () => {
    gameOver = true;
    sessionStorage.setItem(SESSION_KEY, 'true');
    dissolve();
  });

  buildBoard();
  renderBoard();
})();
