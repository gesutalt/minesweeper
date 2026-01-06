/*************************************************
 * 인앱 브라우저 차단 판별
 *************************************************/
const ua = navigator.userAgent.toLowerCase();
const isInApp =
  ua.includes("kakaotalk") ||
  ua.includes("naver") ||
  ua.includes("daum") ||
  ua.includes("instagram") ||
  ua.includes("fbav") ||
  ua.includes("fb_iab");

/*************************************************
 * 초기 화면 분기
 *************************************************/
window.onload = function () {
  if (isInApp) {
    document.getElementById("blocker").style.display = "block";
  } else {
    document.getElementById("app").style.display = "block";
    startGame("easy");
  }
};

/*************************************************
 * 브라우저로 열기
 *************************************************/
function openExternal() {
  const url = location.href;

  if (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) {
    alert("공유 버튼을 누른 후\n'사파리에서 열기'를 선택해주세요.");
  } else {
    location.href =
      "intent://" +
      url.replace(/^https?:\/\//, "") +
      "#Intent;scheme=https;package=com.android.chrome;end";
  }
}

/*************************************************
 * 게임 로직
 *************************************************/
let ROWS = 9, COLS = 9, MINES = 10;
let board = [];
let gameOver = false;
let opened = 0;
let longPressTriggered = false;

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
          if (board[r + dr]?.[c + dc]?.mine) cnt++;
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
    e.preventDefault();
    longPressTriggered = false;

    timer = setTimeout(() => {
      toggleFlag(r, c);
      longPressTriggered = true;
    }, 500);
  });

  el.addEventListener("touchend", () => clearTimeout(timer));
  el.addEventListener("touchmove", () => clearTimeout(timer));

  el.addEventListener("click", () => {
    if (longPressTriggered) return;
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
        board[r + dr]?.[c + dc] && openCell(r + dr, c + dc);
  }

  if (opened === ROWS * COLS - MINES) {
    setTimeout(() => {
      alert("👽 진실을 발견했습니다.\nX-Files는 존재합니다.");
    }, 200);
    gameOver = true;
  }
}
