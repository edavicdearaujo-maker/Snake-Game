const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");

// --- CONFIGURAÇÕES DO TABULEIRO ---
const TAMANHO_BLOCO = 20; // Cada quadrado tem 20x20 pixels
const QUANTIDADE_BLOCOS = canvas.width / TAMANHO_BLOCO; // 20 colunas e 20 linhas

// --- ESTADO DO JOGO ---
let cobra = [{ x: 2, y: 10 }, { x: 1, y: 10 }, { x: 0, y: 10 }];

let velX = 1;  // Começa andando para a direita
let velY = 0;
let pontuacao = 0;
let podeMudarDirecao = true; // Trava para evitar o bug de apertar duas teclas no mesmo frame
let comida = { x: 0, y: 0 }; // Inicializa a variável da comida

// --- FUNÇÃO PARA GERAR COMIDA EM LUGAR SEGURO ---
function gerarComida() {
    let posicaoInvalida = true;
    let novaX, novaY;

    // O loop continua rodando enquanto a posição sorteada colidir com a cobra
    while (posicaoInvalida) {
        novaX = Math.floor(Math.random() * QUANTIDADE_BLOCOS);
        novaY = Math.floor(Math.random() * QUANTIDADE_BLOCOS);

        posicaoInvalida = false; // Assume que a posição é boa

        // Checa se a nova posição bateu em qualquer pedaço da cobra
        for (let i = 0; i < cobra.length; i++) {
            if (cobra[i].x === novaX && cobra[i].y === novaY) {
                posicaoInvalida = true; // Posição inválida! Força o 'while' a rodar de novo
                break;
            }
        }
    }

    // Quando encontra um lugar seguro, define a posição da comida
    comida.x = novaX;
    comida.y = novaY;
}

// Gera a primeira comida do jogo
gerarComida();

// --- CONTROLE DO TECLADO ---
window.addEventListener("keydown", (e) => {
    if (!podeMudarDirecao) return;

    if ((e.key === "ArrowUp" || e.key === "w") && velY !== 1) {
        velX = 0; velY = -1;
        podeMudarDirecao = false;
    } 
    else if ((e.key === "ArrowDown" || e.key === "s") && velY !== -1) {
        velX = 0; velY = 1;
        podeMudarDirecao = false;
    } 
    else if ((e.key === "ArrowLeft" || e.key === "a") && velX !== 1) {
        velX = -1; velY = 0;
        podeMudarDirecao = false;
    } 
    else if ((e.key === "ArrowRight" || e.key === "d") && velX !== -1) {
        velX = 1; velY = 0;
        podeMudarDirecao = false;
    }
});

// --- LÓGICA DE ATUALIZAÇÃO ---
function update() {
    podeMudarDirecao = true;

    // 1. Movimento dominó do corpo
    for (let i = cobra.length - 1; i > 0; i--) {
        cobra[i].x = cobra[i - 1].x;
        cobra[i].y = cobra[i - 1].y;
    }

    // 2. Move a cabeça
    cobra[0].x += velX;
    cobra[0].y += velY;

    // 3. Colisão com as paredes
    if (cobra[0].x < 0 || cobra[0].x >= QUANTIDADE_BLOCOS || 
        cobra[0].y < 0 || cobra[0].y >= QUANTIDADE_BLOCOS) {
        draw(); 
        alert("GAME OVER! Você bateu na parede. Pontos: " + pontuacao);
        reiniciarJogo();
        return;
    }

    // 4. Colisão com o próprio corpo
    for (let i = 1; i < cobra.length; i++) {
        if (cobra[0].x === cobra[i].x && cobra[0].y === cobra[i].y) {
            draw(); 
            alert("GAME OVER! Você se mordeu. Pontos: " + pontuacao);
            reiniciarJogo();
            return;
        }
    }

    // 5. Comer a Comida
    if (cobra[0].x === comida.x && cobra[0].y === comida.y) {
        pontuacao += 10;
        scoreDisplay.innerText = pontuacao;

        cobra.push({ x: cobra[cobra.length - 1].x, y: cobra[cobra.length - 1].y });

        // Usa a nova função segura para reposicionar a comida
        gerarComida();
    }
}

// --- RENDERIZAÇÃO (Desenho) ---
function draw() {
    ctx.fillStyle = "#1f2833";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a comida (Vermelha)
    ctx.fillStyle = "#ff4a4a";
    ctx.fillRect(comida.x * TAMANHO_BLOCO, comida.y * TAMANHO_BLOCO, TAMANHO_BLOCO - 2, TAMANHO_BLOCO - 2);

    // Desenha a cobra com degradê verde escuro -> verde claro
    for (let i = 0; i < cobra.length; i++) {
        let claridade = 25 + (i * (45 / cobra.length)); 
        ctx.fillStyle = `hsl(120, 100%, ${claridade}%)`;
        ctx.fillRect(cobra[i].x * TAMANHO_BLOCO, cobra[i].y * TAMANHO_BLOCO, TAMANHO_BLOCO - 2, TAMANHO_BLOCO - 2);
    }
}

// --- RESET ---
function reiniciarJogo() {
    cobra = [{ x: 2, y: 10 }, { x: 1, y: 10 }, { x: 0, y: 10 }];
    velX = 1;
    velY = 0;
    pontuacao = 0;
    podeMudarDirecao = true;
    scoreDisplay.innerText = pontuacao;
    gerarComida(); // Sorteia uma comida nova para o recomeço
}

// --- GAME LOOP ---
setInterval(() => {
    update();
    draw();
}, 100);