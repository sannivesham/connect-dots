(function () {
  function renderGrid() {
    const gridEl = document.getElementById("levelGrid");
    if (!gridEl || !window.DOTS_LEVELS) return;

    gridEl.innerHTML = "";

    window.DOTS_LEVELS.forEach((level) => {
      const isUnlocked = typeof window.Progress?.isUnlocked === "function" 
        ? window.Progress.isUnlocked(level.id) 
        : (level.id === 1);

      const progress = typeof window.Progress?.getLevelProgress === "function"
        ? window.Progress.getLevelProgress(level.id)
        : { completed: false, bestTime: null };

      const card = document.createElement(isUnlocked ? "a" : "div");
      card.className = `level-card ${isUnlocked ? "" : "locked"}`;
      
      if (isUnlocked) {
        card.href = `game.html?level=${level.id}`;
      }

      let innerHTML = `
        <div class="level-number">LEVEL ${level.id}</div>
        <div class="level-title" style="font-weight: 600; font-size: 1.35rem; margin-bottom: 2px;">${level.titleTelugu}</div>
        <div class="level-subtitle" style="font-family: 'Cinzel', serif; font-size: 0.95rem; color: var(--gold); opacity: 0.85; margin-bottom: 12px;">(${level.titleEnglish})</div>
        <div class="level-meta" style="font-size: 0.85rem; opacity: 0.75;">
          <span>జతపరచడం (Match)</span>
      `;

      if (progress.completed) {
        innerHTML += `<span> · విజయం (Won)</span>`;
      }

      innerHTML += `</div>`;

      if (!isUnlocked) {
        innerHTML += `<div class="level-lock-icon" style="position: absolute; top: 20px; right: 20px;">🔒</div>`;
      }

      card.innerHTML = innerHTML;
      gridEl.appendChild(card);
    });
  }

  renderGrid();
  setInterval(renderGrid, 1000);
})();
