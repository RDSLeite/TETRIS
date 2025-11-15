const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const musicMain = document.getElementById("musicMain");
const musicLevelUp = document.getElementById("musicLevelUp");
const musicLeaderboard = document.getElementById("musicLeaderboard");
const musicGameOver = document.getElementById("musicGameOver");
const nextCanvas = document.getElementById("next");
const nextContext = nextCanvas.getContext("2d");
nextContext.scale(10, 10); // Escala menor que o principal
musicMain.loop = true;
musicLevelUp.loop = false;
musicLeaderboard.loop = true;
musicGameOver.loop = false;
let isPaused = false;
let wasSelectPressed = false; // para detectar "apertou agora"

context.scale(40, 40);

const arena = createMatrix(12, 20);

const colorPalettes = [
  [
    null,
    "#FF0D72",
    "#0DC2FF",
    "#0DFF72",
    "#F538FF",
    "#FF8E0D",
    "#FFE138",
    "#3877FF",
  ],
  [
    null,
    "#FF595E",
    "#FFCA3A",
    "#8AC926",
    "#1982C4",
    "#6A4C93",
    "#FF924C",
    "#C492FF",
  ],
  [
    null,
    "#F72585",
    "#7209B7",
    "#3A0CA3",
    "#4361EE",
    "#4CC9F0",
    "#B5179E",
    "#560BAD",
  ],
  [
    null,
    "#06D6A0",
    "#118AB2",
    "#FFD166",
    "#EF476F",
    "#FF8FA3",
    "#D6FFF6",
    "#5C5470",
  ],
  [
    null,
    "#ffadad",
    "#ffd6a5",
    "#fdffb6",
    "#caffbf",
    "#9bf6ff",
    "#a0c4ff",
    "#bdb2ff",
  ],
  [
    null,
    "#80ed99",
    "#57cc99",
    "#38a3a5",
    "#22577a",
    "#cdb4db",
    "#ffc8dd",
    "#ffafcc",
  ],
  [
    null,
    "#e63946",
    "#f1faee",
    "#a8dadc",
    "#457b9d",
    "#1d3557",
    "#ffb703",
    "#fb8500",
  ],
  [
    null,
    "#3d405b",
    "#81b29a",
    "#f2cc8f",
    "#e07a5f",
    "#f4f1de",
    "#1a535c",
    "#4ecdc4",
  ],
  [
    null,
    "#011627",
    "#2ec4b6",
    "#e71d36",
    "#ff9f1c",
    "#ffbf69",
    "#cbf3f0",
    "#8d99ae",
  ],
  [
    null,
    "#240046",
    "#5a189a",
    "#9d4edd",
    "#c77dff",
    "#ffb3c1",
    "#ff758f",
    "#fb6f92",
  ],
];
const inputState = {
  left: { pressed: false, lastMove: 0 },
  right: { pressed: false, lastMove: 0 },
  down: { pressed: false, lastMove: 0 },
};

const KEY_REPEAT_DELAY = 150;
const KEY_REPEAT_INTERVAL = 50;

while (colorPalettes.length < 100) {
  const last = colorPalettes[colorPalettes.length - 1];
  const newPalette = [
    null,
    ...last.slice(1).map((color) => {
      const [r, g, b] = color.match(/\w\w/g).map((x) => parseInt(x, 16));
      return `#${((r + 20) % 256).toString(16).padStart(2, "0")}${(
        (g + 20) %
        256
      )
        .toString(16)
        .padStart(2, "0")}${((b + 20) % 256).toString(16).padStart(2, "0")}`;
    }),
  ];
  colorPalettes.push(newPalette);
}

let gamepadIndex = null;

window.addEventListener("gamepadconnected", (e) => {
  console.log("Gamepad conectado:", e.gamepad);
  gamepadIndex = e.gamepad.index;
});

window.addEventListener("gamepaddisconnected", () => {
  console.log("Gamepad desconectado");
  gamepadIndex = null;
});

let currentColors = colorPalettes[0];
let targetColors = colorPalettes[0];
let transitionProgress = 1;
let nextPiece = createPiece("T"); // ou inicializa com uma aleatória
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameRunning = false; // ✅ FLAG DE CONTROLO

let player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
  name: "",
  level: 0,
  lines: 0,
};

let gamepadHoldState = {
  left: false,
  right: false,
  down: false,
  timers: {
    left: null,
    right: null,
    down: null,
  },
};

function togglePause() {
  if (!gameRunning) return;

  isPaused = !isPaused;

  const btn = document.getElementById("pauseButton");
  if (btn) {
    btn.textContent = isPaused ? "▶️ Continuar" : "⏸️ Pause";
  }

  if (!isPaused) {
    lastTime = performance.now();
    update(); // volta o loop
  }
}

function handleGamepadInput() {
  if (gamepadIndex === null) return;

  const gp = navigator.getGamepads()[gamepadIndex];
  if (!gp) return;

  const buttons = {
    left: gp.buttons[14]?.pressed,
    right: gp.buttons[15]?.pressed,
    down: gp.buttons[13]?.pressed,
    a: gp.buttons[1]?.pressed,
    b: gp.buttons[3]?.pressed,
    select: gp.buttons[8]?.pressed,
  };

  // LEFT
  if (buttons.left && !gamepadHoldState.left) {
    gamepadHoldState.left = true;
    playerMove(-1);
    gamepadHoldState.timers.left = setTimeout(() => {
      gamepadHoldState.timers.left = setInterval(() => {
        playerMove(-1);
      }, 50);
    }, 150);
  } else if (!buttons.left && gamepadHoldState.left) {
    gamepadHoldState.left = false;
    clearTimeout(gamepadHoldState.timers.left);
    clearInterval(gamepadHoldState.timers.left);
  }

  // RIGHT
  if (buttons.right && !gamepadHoldState.right) {
    gamepadHoldState.right = true;
    playerMove(1);
    gamepadHoldState.timers.right = setTimeout(() => {
      gamepadHoldState.timers.right = setInterval(() => {
        playerMove(1);
      }, 50);
    }, 150);
  } else if (!buttons.right && gamepadHoldState.right) {
    gamepadHoldState.right = false;
    clearTimeout(gamepadHoldState.timers.right);
    clearInterval(gamepadHoldState.timers.right);
  }

  // DOWN
  if (buttons.down && !gamepadHoldState.down) {
    gamepadHoldState.down = true;
    playerDrop();
    gamepadHoldState.timers.down = setTimeout(() => {
      gamepadHoldState.timers.down = setInterval(() => {
        playerDrop();
      }, 50);
    }, 150);
  } else if (!buttons.down && gamepadHoldState.down) {
    gamepadHoldState.down = false;
    clearTimeout(gamepadHoldState.timers.down);
    clearInterval(gamepadHoldState.timers.down);
  }

  // A = rodar horário
  if (buttons.a && !handleGamepadInput.aPressed) {
    playerRotate(1);
    handleGamepadInput.aPressed = true;
  } else if (!buttons.a) {
    handleGamepadInput.aPressed = false;
  }

  // B = rodar anti-horário
  if (buttons.b && !handleGamepadInput.bPressed) {
    playerRotate(-1);
    handleGamepadInput.bPressed = true;
  } else if (!buttons.b) {
    handleGamepadInput.bPressed = false;
  }
}

function stopAllMusic() {
  [musicGameOver, musicMain, musicLevelUp, musicLeaderboard].forEach((m) => {
    m.pause();
    m.currentTime = 0;
  });
}

function playMusic(track) {
  stopAllMusic();
  track.volume = isMuted ? 0 : 0.5;
  track.play().catch(() => {});
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case "T":
      return [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ];
    case "O":
      return [
        [2, 2],
        [2, 2],
      ];
    case "L":
      return [
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0],
      ];
    case "J":
      return [
        [4, 0, 0],
        [4, 4, 4],
        [0, 0, 0],
      ];
    case "I":
      return [
        [0, 0, 0, 0],
        [5, 5, 5, 5],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
    case "S":
      return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
      ];
    case "Z":
      return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
      ];
  }
}

function drawMatrix(matrix, offset) {
  const blockSize = 1;
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const px = x + offset.x;
        const py = y + offset.y;
        context.fillStyle = interpolateColor(
          currentColors[value],
          targetColors[value],
          transitionProgress
        );
        context.fillRect(px, py, blockSize, blockSize);
        context.strokeStyle = "black";
        context.lineWidth = 0.05;
        context.strokeRect(px, py, blockSize, blockSize);
        context.fillStyle = "rgba(255, 255, 255, 0.15)";
        context.fillRect(px, py, 0.5, 0.1);
        context.fillRect(px, py, 0.1, 0.5);
        context.fillStyle = "rgba(0, 0, 0, 0.25)";
        context.fillRect(px + 0.9, py, 0.1, 1);
        context.fillRect(px, py + 0.9, 1, 0.1);
      }
    });
  });
}

function drawGrid() {
  const cols = arena[0].length;
  const rows = arena.length;

  context.strokeStyle = "rgba(255, 255, 255, 0.08)"; // cor discreta
  context.lineWidth = 0.03;

  for (let x = 0; x <= cols; x++) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, rows);
    context.stroke();
  }

  for (let y = 0; y <= rows; y++) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(cols, y);
    context.stroke();
  }
}

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function drawNext() {
  nextContext.setTransform(1, 0, 0, 1, 0, 0); // reset transformação
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height); // limpa fundo
  nextContext.scale(20, 20); // ESCALA MAIOR (10 → 20)

  const matrix = nextPiece;
  const offsetX = Math.floor((nextCanvas.width / 20 - matrix[0].length) / 2);
  const offsetY = Math.floor((nextCanvas.height / 20 - matrix.length) / 2);

  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const color = interpolateColor(
          currentColors[value],
          targetColors[value],
          transitionProgress
        );
        nextContext.fillStyle = color;
        nextContext.fillRect(offsetX + x, offsetY + y, 1, 1);
        nextContext.strokeStyle = "black";
        nextContext.lineWidth = 0.1;
        nextContext.strokeRect(offsetX + x, offsetY + y, 1, 1);
      }
    });
  });
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function animateLineClear(lines, isTetris) {
  const blockSize = 40; // porque fizeste context.scale(40, 40)
  const overlay = document.createElement("canvas");
  overlay.width = canvas.width;
  overlay.height = canvas.height;
  overlay.style.position = "absolute";
  overlay.style.left = canvas.offsetLeft + "px";
  overlay.style.top = canvas.offsetTop + "px";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = 10;
  document.body.appendChild(overlay);

  const ctx = overlay.getContext("2d");
  ctx.scale(40, 40);

  let alpha = 1;
  const flashColor = "rgba(255, 255, 255, ALPHA)";

  function drawFlash() {
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    lines.forEach((y) => {
      ctx.fillStyle = flashColor.replace("ALPHA", alpha.toFixed(2));
      ctx.fillRect(0, y, arena[0].length, 1);
    });
  }

  const interval = setInterval(() => {
    alpha -= 0.1;
    if (alpha <= 0) {
      clearInterval(interval);
      overlay.remove();
    } else {
      drawFlash();
    }
  }, 30);
}

function playerDrop() {
  if (isPaused) return;
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    const linesCleared = arenaSweep();
    if (linesCleared > 0) {
      const levelFactor = player.level + 1;
      let points = 0;

      switch (linesCleared) {
        case 1:
          points = 40 * levelFactor;
          break;
        case 2:
          points = 100 * levelFactor;
          break;
        case 3:
          points = 300 * levelFactor;
          break;
        case 4:
          points = 1200 * levelFactor;
          break;
      }

      player.score += points;
      player.lines += linesCleared;
      const newLevel = Math.floor(player.lines / 10);
      if (newLevel > player.level) {
        player.level = newLevel;
        const levelSpeeds = [
          800, 717, 633, 550, 467, 383, 300, 217, 133, 100, 83, 83, 83, 67, 67,
          67, 50, 50, 50, 33,
        ];
        dropInterval = levelSpeeds[player.level] || 17;
        showLevelUp();
      }
    }
    updateScore();
    playerReset();
  }
  dropCounter = 0;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function showLevelUp() {
  if (document.getElementById("levelUpOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "levelUpOverlay";
  overlay.innerText = "NÍVEL " + player.level;
  document.body.appendChild(overlay);

  playMusic(musicLevelUp);

  setTimeout(() => {
    overlay.remove();
    musicMain.play();
    transitionProgress = 0;
    currentColors = colorPalettes[(player.level - 1) % colorPalettes.length];
    targetColors = colorPalettes[player.level % colorPalettes.length];
  }, 2000);
}

function playerReset() {
  player.matrix = nextPiece;
  nextPiece = createPiece("TJLOSZI"[Math.floor(Math.random() * 7)]);
  player.pos.y = 0;
  player.pos.x =
    ((arena[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);

  if (collide(arena, player)) {
    gameRunning = false;
    arena.forEach((row) => row.fill(0));
    if (!scoreSaved) {
      saveScore(player.name, player.score);
      scoreSaved = true;
    }

    stopAllMusic();
    playMusic(musicGameOver); // ✅ TOCA MÚSICA DE GAME OVER

    document.getElementById("game").style.display = "none";
    document.getElementById("gameOver").style.display = "block";
    document.getElementById("finalScore").innerText =
      "Pontuação final: " + player.score;
  }
}

function playerMove(dir) {
  if (isPaused) return;
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
}

function playerRotate(dir) {
  if (isPaused) return;

  const originalMatrix = JSON.parse(JSON.stringify(player.matrix)); // cópia
  rotate(player.matrix, dir);

  if (collide(arena, player)) {
    // se colidir, desfaz rotação
    player.matrix = originalMatrix;
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) matrix.forEach((row) => row.reverse());
  else matrix.reverse();
}

function interpolateColor(c1, c2, t) {
  const parse = (c) => c.match(/\w\w/g).map((x) => parseInt(x, 16));
  const toHex = (v) => v.toString(16).padStart(2, "0");
  const [r1, g1, b1] = parse(c1);
  const [r2, g2, b2] = parse(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function arenaSweep() {
  let rowCount = 0;
  let clearedLines = [];

  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    clearedLines.push(y);
    ++rowCount;
    ++y;
  }

  if (rowCount > 0) {
    animateLineClear(clearedLines, rowCount === 4); // 👈 aqui chamamos o efeito
  }

  return rowCount;
}

function updateScore() {
  document.getElementById("score").innerText = "Pontuação: " + player.score;
  document.getElementById("level").innerText = "Nível: " + player.level;
}

function update(time = 0) {
  // 🔥 MANTÉM o loop funcionando se pausado — mesmo que gameRunning = false
  if (!gameRunning && !isPaused) return;

  if (!isPaused && gameRunning) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (transitionProgress < 1) {
      transitionProgress += deltaTime / 300;
      if (transitionProgress >= 1) {
        transitionProgress = 1;
        currentColors = targetColors;
      }
    }

    if (dropCounter > dropInterval) playerDrop();

    draw();
    drawNext();
  }

  // 🔁 ESSENCIAL: permite SELECT funcionar sempre
  handleGamepadInput();

  requestAnimationFrame(update);
}

let scoreSaved = false;

function saveScore(name, score) {
  if (isPaused) return; // ← bloqueia salvar durante pause
  const data = {
    datascore: new Date().toISOString().slice(0, 19).replace("T", " "),
    nickname: name,
    score: score,
    game: "Tetris",
  };

  fetch("http://localhost:3000/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then(() => console.log("Score salvo com sucesso"))
    .catch((err) => console.error("Erro ao salvar score:", err));
}

function showScoreboard() {
  stopAllMusic();
  playMusic(musicLeaderboard);

  fetch("http://localhost:3000/api/scores/bygame/Tetris")
    .then((res) => res.json())
    .then((scores) => {
      const list = document.getElementById("scoreList");
      list.innerHTML = "";
      scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .forEach(({ nickname, score }) => {
          const li = document.createElement("li");
          li.textContent = `${nickname} - ${score}`;
          list.appendChild(li);
        });
    })
    .catch((err) => console.error("Erro ao buscar leaderboard:", err));

  document.getElementById("menu").style.display = "none";
  document.getElementById("scoreboard").style.display = "block";
}

function backToMenu() {
  gameRunning = false; // ✅ cancela update loop
  document.getElementById("menu").style.display = "block";
  document.getElementById("game").style.display = "none";
  document.getElementById("gameOver").style.display = "none";
  document.getElementById("scoreboard").style.display = "none";

  // ✅ LIMPA O PLAYER PARA EVITAR SCORE DUPLICADO
  player.name = "";
  player.score = 0;
  player.level = 0;
  player.lines = 0;
}
document.getElementById("playButton").addEventListener("click", () => {
  const name = document.getElementById("nickname").value.trim();
  isPaused = false;
  if (!name) return alert("Digite o seu nickname!");
  fetch("http://localhost:3000/api/scores/bygame/Tetris")
    .then((res) => res.json())
    .then((scores) => {
      const nameExists = scores.some(
        (s) => s.nickname.toLowerCase() === name.toLowerCase()
      );

      if (nameExists) {
        alert("Este nickname já está sendo usado. Escolha outro.");
      } else {
        // Inicia o jogo normalmente
        player.name = name;
        player.score = 0;
        player.level = 0;
        player.lines = 0;
        dropInterval = 1000;
        arena.forEach((row) => row.fill(0));
        gameRunning = true;
        document.getElementById("menu").style.display = "none";
        document.getElementById("game").style.display = "block";
        playerReset();
        updateScore();
        update();
        playMusic(musicMain);
      }
    })
    .catch((err) => {
      console.error("Erro ao verificar nickname:", err);
      alert("Erro ao verificar nickname. Tente novamente.");
    });
});

const muteButton = document.getElementById("muteButton");
let isMuted = false;

function updateMuteButtons() {
  document.querySelectorAll(".mute-toggle").forEach((btn) => {
    btn.textContent = isMuted ? "🔇" : "🔊";
  });
}

function toggleMute() {
  isMuted = !isMuted;
  const volume = isMuted ? 0 : 0.5;
  [musicMain, musicLevelUp, musicLeaderboard].forEach((track) => {
    track.volume = volume;
  });
  updateMuteButtons();
}

document.querySelectorAll(".mute-toggle").forEach((btn) => {
  btn.addEventListener("click", toggleMute);
});

document.addEventListener("keydown", (e) => {
  if (!gameRunning || isPaused) return;
  switch (e.key) {
    case "ArrowLeft":
      startRepeatMove(-1);
      break;
    case "ArrowRight":
      startRepeatMove(1);
      break;
    case "ArrowDown":
      playerDrop();
      break;
    case "ArrowUp":
      playerRotate(1);
      break;
  }
});

document.addEventListener("keyup", (e) => {
  if (!isPaused) {
    switch (e.key) {
      case "ArrowLeft":
        stopRepeatMove(-1);
        break;
      case "ArrowRight":
        stopRepeatMove(1);
        break;
    }
  }
});

let heldMoveKeys = {
  left: false,
  right: false,
};

let repeatTimers = {
  left: null,
  right: null,
};

function startRepeatMove(direction) {
  const key = direction === -1 ? "left" : "right";
  if (heldMoveKeys[key]) return; // já a segurar

  heldMoveKeys[key] = true;
  playerMove(direction);

  repeatTimers[key] = setTimeout(() => {
    repeatTimers[key] = setInterval(() => {
      playerMove(direction);
    }, 50); // velocidade de repetição
  }, 150); // delay inicial
}

function stopRepeatMove(direction) {
  const key = direction === -1 ? "left" : "right";
  heldMoveKeys[key] = false;
  clearTimeout(repeatTimers[key]);
  clearInterval(repeatTimers[key]);
  repeatTimers[key] = null;
}

document.getElementById("pauseButton").addEventListener("click", () => {
  togglePause();
});

nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height); // limpa o canvas sem cor

window.showScoreboard = showScoreboard;
window.backToMenu = backToMenu;
