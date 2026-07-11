(function () {
  function getQueryLevel() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("level")) || 1;
    return window.DOTS_LEVELS ? window.DOTS_LEVELS.find(l => l.id === id) : null;
  }

  const level = getQueryLevel();
  if (!level) {
    document.body.innerHTML = "<p style='padding:40px;color:#EDE3C8;'>Level context configuration missing.</p>";
    return;
  }

  document.getElementById("levelTitle").textContent = `లెవెల్ ${level.id}: ${level.titleTelugu}`;
  document.getElementById("levelSubtitle").textContent = level.titleEnglish;

  const leftColumn = document.getElementById("leftColumn");
  const rightColumn = document.getElementById("rightColumn");
  const svgLines = document.getElementById("svgLines");

  let selectedLeft = null;
  let matches = {}; // leftText -> rightText
  let totalPairs = level.pairs.length;

  // Shuffle array helper to randomize choices on screen load
  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  const shuffledLeft = shuffle([...level.pairs]);
  const shuffledRight = shuffle([...level.pairs]);

  // Build nodes
  shuffledLeft.forEach((p, idx) => {
    const node = document.createElement("div");
    node.className = "dot-node";
    node.textContent = p.left;
    node.dataset.side = "left";
    node.dataset.index = idx;
    node.addEventListener("click", () => handleLeftClick(node));
    leftColumn.appendChild(node);
  });

  shuffledRight.forEach((p, idx) => {
    const node = document.createElement("div");
    node.className = "dot-node";
    node.textContent = p.right;
    node.dataset.side = "right";
    node.dataset.index = idx;
    node.addEventListener("click", () => handleRightClick(node));
    rightColumn.appendChild(node);
  });

  function handleLeftClick(node) {
    if (node.classList.contains("matched")) return;
    
    const elements = leftColumn.querySelectorAll(".dot-node");
    elements.forEach(el => el.classList.remove("active"));
    
    node.classList.add("active");
    selectedLeft = node;
  }

  function handleRightClick(node) {
    if (!selectedLeft || node.classList.contains("matched")) return;

    const leftText = selectedLeft.textContent;
    const rightText = node.textContent;

    // Verify if relationship exists inside pristine pairs list
    const isValidPair = level.pairs.some(p => p.left === leftText && p.right === rightText);

    if (isValidPair) {
      matches[leftText] = rightText;
      selectedLeft.classList.remove("active");
      selectedLeft.classList.add("matched");
      node.classList.add("matched");

      drawConnectionLine(selectedLeft, node);
      selectedLeft = null;

      if (Object.keys(matches).length === totalPairs) {
        setTimeout(triggerVictory, 400);
      }
    } else {
      // flash incorrect state error response visually
      selectedLeft.classList.remove("active");
      selectedLeft = null;
    }
  }

  function drawConnectionLine(leftNode, rightNode) {
    const containerRect = document.getElementById("gameContainer").getBoundingClientRect();
    const r1 = leftNode.getBoundingClientRect();
    const r2 = rightNode.getBoundingClientRect();

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    
    // Track node endpoints relative to main canvas space bounding rules
    line.setAttribute("x1", r1.right - containerRect.left);
    line.setAttribute("y1", (r1.top + r1.height / 2) - containerRect.top);
    line.setAttribute("x2", r2.left - containerRect.left);
    line.setAttribute("y2", (r2.top + r2.height / 2) - containerRect.top);

    svgLines.appendChild(line);
  }

  function triggerVictory() {
    if (window.Progress && typeof window.Progress.recordCompletion === "function") {
      window.Progress.recordCompletion(level.id, 0);
    }
    document.getElementById("winOverlay").classList.remove("hidden");

    const nextBtn = document.getElementById("nextLevelBtn");
    if (nextBtn) {
      const nextLevel = window.DOTS_LEVELS ? window.DOTS_LEVELS.find(l => l.id === (level.id + 1)) : null;
      if (nextLevel) {
        nextBtn.onclick = () => {
          window.location.href = `game.html?level=${nextLevel.id}`;
        };
      } else {
        nextBtn.style.display = "none";
      }
    }
  }

  // Handle line recalculation if screen orientation alters mid-game
  window.addEventListener("resize", () => {
    svgLines.innerHTML = "";
    const matchedLeftNodes = leftColumn.querySelectorAll(".dot-node.matched");
    matchedLeftNodes.forEach(ln => {
      const txt = ln.textContent;
      const targetRtxt = matches[txt];
      const rn = Array.from(rightColumn.querySelectorAll(".dot-node")).find(el => el.textContent === targetRtxt);
      if (rn) drawConnectionLine(ln, rn);
    });
  });
})();
