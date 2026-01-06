let ROWS = 9, COLS = 9, MINES = 10;
let board = [];
let gameOver = false;
let opened = 0;

function startGame(level) {
  if (level === "easy") { ROWS = COLS = 9; MINES = 10; }
  if (level === "normal") { ROWS = COLS = 12; MINES = 20; }
  if (level === "hard") { ROWS = COLS = 16; MINES = 40; }
  init();
}

function init() {
  gameOver = false;
  opened = 0;
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
          if (board[nr]?.[nc]?.mine) cnt++;
        }
      }
      board[r][c].count = cnt;
    }
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const d = document.createElement("div");
      d.className = "cell";
      addTouchEvents(d, r, c);
      game.appendChild(d);
      board[r][c].el = d;
    }
  }
}

function addTouchEvents(el, r, c) {
  let timer;

  el.addEventListener("touchstart", (e) => {
    e.preventDefault();   // ⭐ 사파리 기본 동작 차단
    timer = setTimeout(() => toggleFlag(r, c), 500);
  });

  el.addEventListener("touchend", () => {
    clearTimeout(timer);
  });

  el.addEventListener("touchmove", () => {
    clearTimeout(timer);
  });

  el.addEventListener("click", () => {
    openCell(r, c);
  });
}


function toggleFlag(r, c) {
  const cell = board[r][c];
  if (cell.open) return;
  cell.flag = !cell.flag;
  cell.el.classList.toggle("flag");
  cell.el.textContent = cell.flag ? "🚩" : "";
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
    alert("💥 작전 실패… 진실에 너무 가까이 갔습니다.");
    gameOver = true;
    return;
  }

  if (cell.count > 0) {
    cell.el.textContent = cell.count;
  } else {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        board[r+dr]?.[c+dc] && openCell(r+dr, c+dc);
  }

  if (opened === ROWS * COLS - MINES) {
    setTimeout(() => {
      alert("👽 진실을 발견했습니다.\nX-Files는 존재합니다.");
    }, 200);
    gameOver = true;
  }
}
