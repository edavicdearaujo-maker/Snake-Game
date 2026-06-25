const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");

// --- CONFIGURAÇÕES DO TABULEIRO ---
const TAMANHO_BLOCO = 20; 
const QUANTIDADE_BLOCOS = canvas.width / TAMANHO_BLOCO; 

// --- ESTADO DO JOGO ---
let cobra = [
    { x: 2, y: 10 },
    { x: 1, y: 10 },
    { x: 0, y: 10 }
];

let velX = 1;  // Começa andando para a direita
let velY = 0;
let pontuacao = 0;
let podeMudarDirecao = true; 
let comida = { x: 0, y: 0 }; 

// --- FUNÇÃO PARA GERAR COMIDA EM LUGAR SEGURO ---
function gerarComida() {
    let posicaoInvalida = true;
    let novaX, novaY;

    while (posicaoInvalida) {
        novaX = Math.floor(Math.random() * QUANTIDADE_BLOCOS);
        novaY = Math.floor(Math.random() * QUANTIDADE_BLOCOS);

        posicaoInvalida = false; 

        for (let i = 0; i < cobra.length; i++) {
            if (cobra[i].x === novaX && cobra[i].y === novaY) {
                posicaoInvalida = true; 
                break;
            }
        }
    }

    comida.x = novaX;
    comida.y = novaY;
}

// Gera a primeira comida do jogo
gerarComida();

// --- CONTROLE DO TECLADO (PC) ---
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

// --- CONTROLES TÁTEIS (CELULAR) ---
const btnUp = document.getElementById("btn-up");
const btnDown = document.getElementById("btn-down");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");

function mudarDirecaoBotao(novaVelX, novaVelY) {
    if (!podeMudarDirecao) return;

    // Impede inversão direta de movimentos
    if (novaVelX !== 0 && velX === -novaVelX) return;
    if (novaVelY !== 0 && velY === -novaVelY) return;

    velX = novaVelX;
    velY = novaVelY;
    podeMudarDirecao = false;
}

// Suporte para cliques físicos no mouse e toques na tela (touchstart previne delay)
const botoes = [
    { elemento: btnUp, dx: 0, dy: -1 },
    { elemento: btnDown, dx: 0, dy: 1 },
    { elemento: btnLeft, dx: -1, dy: 0 },
    { elemento: btnRight, dx: 1, dy: 0 }
];

botoes.forEach(botao => {
    botao.elemento.addEventListener("click", () => mudarDirecaoBotao(botao.dx, botao.dy));
    botao.elemento.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Evita dar zoom na tela ao clicar rápido
        mudarDirecaoBotao(botao.dx, botao.dy);
    });
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

    // Desenha a cobra com degradê dinâmico
    for (let i = 0; i < cobra.length; i++) {
        let claridade = 25 + (i * (45 / cobra.length)); 
        ctx.fillStyle = `hsl(120, 100%, ${claridade}%)`;
        ctx.fillRect(cobra[i].x * TAMANHO_BLOCO, cobra[i].y * TAMANHO_BLOCO, TAMANHO_BLOCO - 2, TAMANHO_BLOCO - 2);
    }
}

// --- RESET SEGURO ---
function reiniciarJogo() {
    cobra = [
        { x: 2, y: 10 },
        { x: 1, y: 10 },
        { x: 0, y: 10 }
    ];
    velX = 1;
    velY = 0;
    pontuacao = 0;
    podeMudarDirecao = true;
    scoreDisplay.innerText = pontuacao;
    gerarComida(); 
}

// --- GAME LOOP ---
setInterval(() => {
    update();
    draw();
}, 100);
