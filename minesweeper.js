window.Minesweeper = (function () {
  const STAR_PATH = "M58.33,2.73 L65.82,34.72 L97.53,43.32 L69.42,60.33 L71.04,93.14 L46.18,71.67 L15.47,83.35 L28.21,53.06 L7.62,27.46 L40.36,30.23 Z";

  function starSvg() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="${STAR_PATH}"/></svg>`;
  }

  function create(boardEl, options) {
    const opts = Object.assign({
      size: 8,
      starCount: 10,
      onExplode: () => { },
      onWin: () => { },
    }, options);

    let cells = [];
    let revealedCount = 0;
    let gameOver = false;

    boardEl.style.setProperty('--board-size', opts.size);

    function neighbors(i) {
      const row = Math.floor(i / opts.size);
      const col = i % opts.size;
      const result = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < opts.size && c >= 0 && c < opts.size) {
            result.push(r * opts.size + c);
          }
        }
      }
      return result;
    }

    function buildBoard() {
      cells = Array.from({ length: opts.size * opts.size }, () => ({
        star: false,
        revealed: false,
        flagged: false,
        count: 0,
      }));

      let placed = 0;
      while (placed < opts.starCount) {
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

    function renderBoard() {
      boardEl.innerHTML = '';
      cells.forEach((cell, i) => {
        const btn = document.createElement('button');
        btn.className = 'tile';
        btn.type = 'button';

        btn.addEventListener('click', () => {
          handleClick(i);
        });
        btn.addEventListener('contextmenu', (event) => {
          event.preventDefault();
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
      const btn = boardEl.children[i];
      btn.classList.add('revealed', 'star', 'loss-fade');
      btn.innerHTML = starSvg();

      requestAnimationFrame(() => {
        btn.classList.add('loss-white');
      });

      setTimeout(() => {
        btn.classList.add('vanish');
      }, 1320);

      opts.onExplode();
    }

    function checkWin() {
      const safeCells = cells.length - opts.starCount;
      if (revealedCount >= safeCells && !gameOver) {
        rippleWin();
      }
    }

    function rippleWin() {
      gameOver = true;

      const RIPPLE_TOTAL_MS = 1000;
      const VANISH_MS = 220;
      const tiles = Array.from(boardEl.children);
      const order = tiles
        .map((_, index) => index)
        .sort(() => Math.random() - 0.5);

      tiles.forEach((tile, index) => {
        const delay = order.indexOf(index) * 14;
        tile.style.transition = `opacity ${VANISH_MS}ms ease ${delay}ms, transform ${VANISH_MS}ms ease ${delay}ms`;
        tile.classList.add('vanish');
      });

      opts.onWin(RIPPLE_TOTAL_MS);
    }

    function reset() {
      gameOver = false;
      revealedCount = 0;
      buildBoard();
      renderBoard();
    }

    reset();

    return { reset };
  }

  return { create };
})();
