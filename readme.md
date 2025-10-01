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

3. Criação da Arena de Jogo
   js
   function createMatrix(w, h) {
   const matrix = [];
   while (h--) matrix.push(new Array(w).fill(0));
   return matrix;
   }
   Cria a "arena" de 12x20 (largura x altura), preenchida com zeros.

Cada célula representará uma parte vazia ou ocupada por uma peça.

4. Criação de Peças (Tetriminos NES)
   js
   function createPiece(type) {
   switch (type) {
   case "T": return [[0, 1, 0], [1, 1, 1]];
   case "O": return [[2, 2], [2, 2]];
   case "L": return [[0, 0, 3], [3, 3, 3]];
   case "J": return [[4, 0, 0], [4, 4, 4]];
   case "I": return [[0, 0, 0, 0], [5, 5, 5, 5]];
   case "S": return [[0, 6, 6], [6, 6, 0]];
   case "Z": return [[7, 7, 0], [0, 7, 7]];
   }
   }
   Define as sete peças clássicas do Tetris da NES.

Cada número representa uma cor/padrão único.

5. Desenho da Matriz e Blocos
   js
   function drawMatrix(matrix, offset) {
   matrix.forEach((row, y) => {
   row.forEach((value, x) => {
   if (value !== 0) {
   context.fillStyle = interpolateColor(
   currentColors[value],
   targetColors[value],
   transitionProgress
   );
   context.fillRect(x + offset.x, y + offset.y, 1, 1);
   context.strokeStyle = "black";
   context.lineWidth = 0.05;
   context.strokeRect(x + offset.x, y + offset.y, 1, 1);
   }
   });
   });
   }
   drawMatrix é usada para desenhar peças ou arena.

Usa interpolação de cor para criar efeitos de transição suave.

Desenha cada bloco com contorno e relevo.

6. Movimento Lateral com Teclado (Com Repetição)
   js
   function startRepeatMove(direction) {
   const key = direction === -1 ? "left" : "right";
   if (heldKeys[key]) return;
   heldKeys[key] = true;
   playerMove(direction);
   repeatTimers[key] = setTimeout(() => {
   repeatTimers[key] = setInterval(() => {
   playerMove(direction);
   }, 50);
   }, 150);
   }
   Permite segurar seta esquerda/direita para movimento fluido.

Simula o comportamento original da consola NES com delay e repetição contínua.

7. Movimento Vertical Rápido (Tecla ou Botão)
   js
   function playerDrop() {
   player.pos.y++;
   if (collide(arena, player)) {
   player.pos.y--;
   merge(arena, player);
   const linesCleared = arenaSweep();
   if (linesCleared > 0) {
   const points = linesCleared === 4 ? 1000 : linesCleared \* 100;
   player.score += points;
   player.lines += linesCleared;
   updateScore();
   }
   playerReset();
   }
   dropCounter = 0;
   }
   Move a peça para baixo, com colisão e pontuação automática.

merge insere a peça na arena.

arenaSweep valida linhas completas.

8. Colisão com Arena
   js
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
   Detecta se a peça atual entra em contacto com o fundo ou outras peças.

É usado antes de aplicar qualquer movimento.

9. Rodar Peças (Botão A / B / Tecla ↑)
   js
   function playerRotate(dir) {
   const pos = player.pos.x;
   let offset = 1;
   rotate(player.matrix, dir);
   while (collide(arena, player)) {
   player.pos.x += offset;
   offset = -(offset + (offset > 0 ? 1 : -1));
   if (offset > player.matrix[0].length) {
   rotate(player.matrix, -dir);
   player.pos.x = pos;
   return;
   }
   }
   }
   Gira a peça no sentido horário ou anti-horário.

Corrige posição com offset lateral para evitar colisão com bordas.

10. Função de Rotação
    js
    Copiar
    Editar
    function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
    [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
    }
    Inverte as linhas e colunas da matriz (transposição).

Depois, roda com base na direção (dir):

+1: sentido horário

-1: sentido anti-horário
