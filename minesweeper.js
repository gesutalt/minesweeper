const ROWS = 9;
const COLS = 9;
const MINES = 10;

let board = [];
let gameOver = false;

function init() {
  gameOver = false;
  board = [];
  const game = document.getElementById("game");
  game.innerHTML = "";

  // 보드 초기화
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      board[r][c] = {
        mine: false,
        open: false,
        count: 0,
        el: null
      };
    }
  }

  // 지뢰 배치
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  // 숫자 계산
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 && nr < ROWS &&
            nc >= 0 && nc < COLS &&
            board[nr][nc].mine
          ) {
            count++;
          }
        }
      }
      board[r][c].count = count;
    }
  }

  // 화면 생성
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const div = document.createElement("div");
      div.className = "cell";
      div.onclick = () => openCell(r, c);
      game.appendChild(div);
      board[r][c].el = div;
    }
  }
}

function openCell(r, c) {
  if (gameOver) return;
  const cell = board[r][c];
  if (cell.open) return;

  cell.open = true;
  cell.el.classList.add("open");

  if (cell.mine) {
    cell.el.classList.add("mine");
    cell.el.textContent = "💣";
    alert("💥 작전 실패!\n진실에 너무 가까이 다가갔습니다, 멀더 요원.");
    gameOver = true;
    return;
  }

  if (cell.count > 0) {
    cell.el.textContent = cell.count;
  } else {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          openCell(nr, nc);
        }
      }
    }
  }
}

init();
