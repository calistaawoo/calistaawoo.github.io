(function () {
  const boardEl = document.getElementById('board');
  const resetBtn = document.getElementById('reset-btn');

  if (!boardEl) return;

  const DEFAULT_LABEL = 'play again ↻';
  const size = window.matchMedia('(max-width: 480px)').matches ? 6 : 8;
  const starCount = size === 6 ? 7 : 10;

  const game = Minesweeper.create(boardEl, {
    size,
    starCount,
    onExplode: () => {
      resetBtn.textContent = `oh no, star down! ${DEFAULT_LABEL}`;
    },
    onWin: () => {
      resetBtn.textContent = `✦ found them all! ${DEFAULT_LABEL}`;
    },
  });

  resetBtn.addEventListener('click', () => {
    resetBtn.textContent = DEFAULT_LABEL;
    game.reset();
  });
})();
