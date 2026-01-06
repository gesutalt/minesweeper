let ROWS = 9, COLS = 9, MINES = 10;
let board = [];
let gameOver = false;
let opened = 0;
let flags = 0; // 개선: 깃발 수 카운터 추가

function startGame(level) {
  if (level === "easy") { ROWS = COLS = 9; MINES = 10; }
  if (level === "normal") { ROWS = COLS = 12; MINES = 20; }
  if (level === "hard") { ROWS = COLS = 16; MINES = 40; }
  init();
}

function init() {
  gameOver = false;
  opened = 0;
  flags = 0; // 개선: 초기화
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
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) cnt++; // 개선: 경계 체크 강화
        }
      }
      board[r][c].count = cnt;
    }
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const d = document.createElement("div");
      d.className = "cell";
      addEvents(d, r, c); // 개선: 이벤트 함수 변경
      game.appendChild(d);
      board[r][c].el = d;
    }
  }
  updateFlagCount(); // 개선: 깃발 카운터 UI 업데이트
}

// 개선: pointer events로 변경 (마우스/터치 통합, 인앱 브라우저 호환성 UP)
function addEvents(el, r, c) {
  let timer;
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault(); // 개선: 기본 동작 방지 (인앱 지연 방지)
    if (e.button === 0 || e.pointerType === "touch") { // 왼클릭 또는 터치
      timer = setTimeout(() => toggleFlag(r, c), 300); // 개선: 500ms -> 300ms로 단축
    }
  });
  el.addEventListener("pointerup", (e) => {
    e.preventDefault();
    clearTimeout(timer);
    if (e.button === 0 || e.pointerType === "touch") {
      openCell(r, c);
    }
  });
  el.addEventListener("contextmenu", (e) => {
    e.preventDefault(); // 개선: 우클릭/긴 누름 메뉴 방지
    toggleFlag(r, c);
  });
}

function toggleFlag(r, c) {
  const cell = board[r][c];
  if (gameOver || cell.open) return;
  cell.flag = !cell.flag;
  cell.el.classList.toggle("flag");
  cell.el.textContent = cell.flag ? "🚩" : "";
  flags += cell.flag ? 1 : -1; // 개선: 카운터 업데이트
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
    revealAllMines(); // 개선: 게임 오버 시 모든 지뢰 공개
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
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) openCell(nr, nc); // 개선: 경계 체크
      }
  }

  if (opened === ROWS * COLS - MINES) {
    setTimeout(() => {
      alert("👽 진실을 발견했습니다.\nX-Files는 존재합니다.");
    }, 200);
    gameOver = true;
  }
}

// 개선: 깃발 카운터 UI 업데이트 함수
function updateFlagCount() {
  const subtitle = document.querySelector(".subtitle");
  subtitle.textContent = `진실은 그 안에 있다.\n하지만 지뢰도 그 안에 있다. (깃발: ${flags}/${MINES})`;
}

// 개선: 게임 오버 시 모든 지뢰 공개
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

// 개선: 페이지 로드 시 기본 init 호출
window.addEventListener("load", () => startGame("easy"));