let ROWS = 9, COLS = 9, MINES = 10;
let board = [];
let gameOver = false;
let opened = 0;
let flags = 0;

function startGame(level) {
  if (level === "easy") { ROWS = COLS = 9; MINES = 10; }
  if (level === "normal") { ROWS = COLS = 12; MINES = 20; }
  if (level === "hard") { ROWS = COLS = 16; MINES = 40; }
  init();
}

function init() {
  gameOver = false;
  opened = 0;
  flags = 0;
  board = [];
  const game = document.getElementById("game");
  game.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  game.innerHTML = "";

  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = { mine: false, open: false, flag: false, count: 0 };
    }
  }

  let placed = 0;
  while (placed < MINES) {
    const r = Math.random() * ROWS | 0;
    const c = Math.random() * COLS | 0;
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;
      let cnt = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) cnt++;
        }
      }
      board[r][c].count = cnt;
    }
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const d = document.createElement("div");
      d.className = "cell";
      addEvents(d, r, c);
      game.appendChild(d);
      board[r][c].el = d;
    }
  }
  updateFlagCount();
}

// 개선: pointer events + chord 기능 추가
function addEvents(el, r, c) {
  let timer;
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    timer = setTimeout(() => {
      const cell = board[r][c];
      if (gameOver) return;
      if (cell.open && cell.count > 0) {
        chordOpen(r, c);  // 신규: 숫자 셀 chord
      } else if (!cell.open) {
        toggleFlag(r, c);  // 깃발 토글
      }
    }, 300);
  });
  el.addEventListener("pointerup", (e) => {
    e.preventDefault();
    clearTimeout(timer);
    const cell = board[r][c];
    if (!gameOver && !cell.open && !cell.flag) {
      openCell(r, c);  // 짧은 탭: 열기
    }
  });
  el.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}

// 신규: chord 기능 (숫자 셀 긴 누름)
function chordOpen(r, c) {
  const cell = board[r][c];
  if (!cell.open || cell.count === 0 || gameOver) return;

  let flagCount = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].flag) {
        flagCount++;
      }
    }
  }

  if (flagCount === cell.count) {
    // 주변 비깃발/비열린 셀 열기
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !board[nr][nc].open && !board[nr][nc].flag) {
          openCell(nr, nc);
        }
      }
    }
  }
}

function toggleFlag(r, c) {
  const cell = board[r][c];
  if (gameOver || cell.open) return;
  cell.flag = !cell.flag;
  cell.el.classList.toggle("flag");
  cell.el.textContent = cell.flag ? "🚩" : "";
  flags += cell.flag ? 1 : -1;
  updateFlagCount();
}

function openCell(r, c) {
  const cell = board[r][c];
  if (gameOver || cell.open || cell.flag) return;

  cell.open = true;
  opened++;
  cell.el.classList.add("open");

  if (cell.mine) {
    cell.el.classList.add("mine");
    cell.el.textContent = "💣";
    revealAllMines();
    alert("💥 작전 실패… 진실에 너무 가까이 갔습니다.");
    gameOver = true;
    return;
  }

  if (cell.count > 0) {
    cell.el.textContent = cell.count;
  } else {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) openCell(nr, nc);
      }
  }

  if (opened === ROWS * COLS - MINES) {
    setTimeout(() => {
      alert("👽 진실을 발견했습니다.\nX-Files는 존재합니다.");
    }, 200);
    gameOver = true;
  }
}

function updateFlagCount() {
  const subtitle = document.querySelector(".subtitle");
  subtitle.innerHTML = `진실은 그 안에 있다.<br>하지만 지뢰도 그 안에 있다. (깃발: ${flags}/${MINES})`;
}

function revealAllMines() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) {
        board[r][c].el.classList.add("mine");
        board[r][c].el.textContent = "💣";
      }
    }
  }
}

window.addEventListener("load", () => startGame("easy"));