# TETRIS

🧠 Relatório Técnico – Tetris do Rui 🎮
Versão Avançada com Integração Gamepad NES + Backend

1. Inicialização do Canvas e Contexto de Desenho
   js
   const canvas = document.getElementById("tetris");
   const context = canvas.getContext("2d");
   context.scale(40, 40); // Aumenta o tamanho dos blocos (visual retro)
   O canvas é o elemento onde tudo é desenhado.

A função scale(40, 40) transforma cada unidade lógica num quadrado de 40x40px, criando o aspeto pixelado retro do Tetris NES.

2. Paletas de Cor Dinâmicas e Transições
   js
   while (colorPalettes.length < 100) {
   const last = colorPalettes[colorPalettes.length - 1];
   const newPalette = [
   null,
   ...last.slice(1).map((color) => {
   const [r, g, b] = color.match(/\w\w/g).map(x => parseInt(x, 16));
   return `#${((r + 20) % 256).toString(16).padStart(2, "0")}${((g + 20) % 256).toString(16).padStart(2, "0")}${((b + 20) % 256).toString(16).padStart(2, "0")}`;
   }),
   ];
   colorPalettes.push(newPalette);
   }
   Gera até 100 paletas de cores automaticamente.

A transição entre paletas ocorre sempre que o jogador sobe de nível.

Cria uma sensação visual dinâmica única para cada fase.

3. Interface do Utilizador (HTML)
   html

<input type="text" id="nickname" placeholder="Nickname" />
<button id="playButton">Jogar</button>
<canvas id="tetris" width="480" height="800"></canvas>
O HTML define:

Um menu inicial com nickname.

Um canvas para o jogo (#tetris) e um para a próxima peça (#next).

Menus dinâmicos: jogo, game over, scoreboard.

4. Estilo Visual (CSS)
   css

body {
background: url("Img/imagemDeFundo.jpg") no-repeat center center fixed;
font-family: "Press Start 2P", monospace;
}
Layout centralizado.

Estilo arcade retro (com fonte “Press Start 2P”).

Palete monocromática com destaque em elementos de status.

5. Paletas de Cor Dinâmicas (JS)
   js

Enquanto (colorPalettes.length < 100) {
const last = colorPalettes[colorPalettes.length - 1];
const newPalette = [
null,
... last.slice(1).map((color) => {
const [r, g, b] = color.match(/\w\w/g).map((x) => parseInt(x, 16));
O resultado é retornado como: `#${((r + 20) % 256).toString(16).padStart(2, "0")}${((g + 20) % 256).toString(16).padStart(2, "0")}${((b + 20) % 256).toString(16).padStart(2, "0")}`;
],
];
colorPalettes.push(newPalette);
}
Sistema para gerar 100 paletas únicas dinamicamente, criando transições visuais entre níveis.

6. Escalonamento Dinâmico
   js

context.scale(40, 40);
nextContext.scale(10, 10);
Escalonamento dos canvas principal e de pré-visualização para visual retro com blocos grandes.

7. Lógica da Arena e Peças
   js

function createMatrix(w, h) {
const matrix = [];
Enquanto h ainda for diferente de 0, adiciona à matriz o resultado da aplicação da função new Array(w).fill(0) a cada elemento da matriz.
return matrix;
}
Criação de arena de 12x20 (tamanho padrão NES).

8. Peças Tetrimino NES
   js

function createPiece(type) {
switch (type) {
case "T": return [[0, 1, 0], [1, 1, 1]];
case "I": return [[5, 5, 5, 5]];
// restantes...
}
}
Todas as sete peças clássicas são definidas com arrays bidimensionais.

9. Controlo por teclado com repetição
   JS

function startRepeatMove(direction) {
const key = direction === -1 ? "left" : "right";
heldKeys[key] = true;
playerMove(direction);
repeatTimers[key] = setTimeout(() => {
repeatTimers[key] = setInterval(() => {
playerMove(direction);
}, 50);
}, 150);
}
Movimento fluido lateral como na NES original (com repetição após o delay).

10. Suporte para comando NES USB (Gamepad).
    js

const gp = navigator.getGamepads()[gamepadIndex];
const buttons = {
left: gp.buttons[14]?.pressed;
a: gp.buttons[1]?.pressed;
b: gp.buttons[3]?.pressed; // botão B
};
Integração com a API do Gamepad. Suporta direções e botões A, B, Select (Pause) e Start.

11. Rotação de peças com A/B
    js

if (buttons.a && !aPressed) {
playerRotate(1); // sentido horário
}
if (buttons.b && !bPressed) {
playerRotate(-1); // anti-horário
}
Botão A: rodar no sentido horário.
Botão B: rodar ao contrário, estilo NES clássico.

12. Pausa com o botão Start (b9).
    JS

if (buttons.start && !startPressed) {
togglePause();
startPressed = true;
}
O botão "Start" (b9) alterna entre pausar/despausar. Também atualiza o texto do botão na UI.

13. Pausa com Select e Bloqueio de Entrada.
    js

if (isPaused) return;
A entrada do jogador é bloqueada quando o jogo está em pausa.

14. Música e Efeitos Sonoros
    js

function playMusic(track) {
stopAllMusic();
track.volume = isMuted ? 0 : 0.5;
track.play();
}
Sistema de áudio para:

Tema principal.

Mudar de nível.

Leaderboard.

Game Over.

15. Sistema de Score e Nível
    js

if (linesCleared > 0) {
player.score += linesCleared === 4 ? 1000 : linesCleared \* 100;
player.lines += linesCleared;
}
Lógica de pontuação baseada no número de linhas limpas e definição do nível.

16. Velocidade Progressiva
    js

const levelSpeeds = [800, 717, 633, 550, ..., 33];
dropInterval = levelSpeeds[player.level] || 17;
Cada nível aumenta a velocidade com base num array predefinido.

17. Sistema de Game Over
    js

if (collide(arena, player)) {
gameRunning = false;
saveScore(player.name, player.score);
}
Quando a peça não cabe ao reiniciar, o jogo termina e a pontuação é salva.

18. Gravação de Pontuação via API
    js

fetch("http://localhost:3000/api/scores", {
method: "POST",
body: JSON.stringify(data)
});
Integração com backend local para guardar score com nickname e data.

19. Leaderboard em Tempo Real
    js

fetch("http://localhost:3000/api/scores/bygame/Tetris")
Mostra o top 10 jogadores ordenado por score, recuperado de um servidor.

20. Reset Seguro
    js

arena.forEach(row => row.fill(0));
playerReset();
Limpeza da arena e reposição do jogador e próxima peça para nova jogada.

21. Transição de Cores entre Níveis
    js

transitionProgress += deltaTime / 300;
currentColors = interpolateColor(...);
Interpolação visual entre paletas de cor para criar transição suave.

22. Grelha Visual de Fundo
    js

function drawGrid() {
context.strokeStyle = "rgba(255, 255, 255, 0.08)";
}
Ajuda visual para alinhar peças no fundo da arena, estilo NES.

23. Overlay de Subida de Nível
    js

overlay.innerText = "NÍVEL " + player.level;
overlay.id = "levelUpOverlay";
Efeito visual com animation quando se muda de nível, com destaque em amarelo.

24. Feedback Visual com Stroke e Sombra
    js

context.strokeStyle = "black";
context.lineWidth = 0.05;
Contorno preto e sombras criam relevo retro nos blocos.

25. Mostrar Próxima Peça
    js

drawMatrix(nextPiece, offset);
Preview visual em canvas à direita da arena.

26. Validação de Nickname Único
    js

if (nameExists) {
alert("Este nickname já está sendo usado.");
}
Evita duplicados no leaderboard.

27. Botão de Mute com Toggle Global
    js

document.querySelectorAll(".mute-toggle").forEach(...);
Botão de som presente em vários menus com estado sincronizado.

28. Transições Suaves no CSS
    css

@keyframes fadeLevelUp {
0% { opacity: 0; }
100% { opacity: 0; }
}
Animação para o overlay de nível.

29. Interface Responsiva
    css

#gameContainer {
display: flex;
gap: 2rem;
}
Design responsivo com painéis laterais para status e controles.

30. Conclusão
    Este projeto não só replica fielmente o Tetris da NES como o aprimora com funcionalidades modernas, visuais dinâmicos, suporte a comandos físicos, música e integração backend. O desenvolvimento envolveu desafios técnicos com requestAnimationFrame, Gamepad API, transições CSS e sincronização de estado de jogo.
