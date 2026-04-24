// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 6,
    speedX: 5,
    speedY: 5,
    maxSpeed: 8
};

const paddleHeight = 80;
const paddleWidth = 10;

const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 6,
    dy: 0
};

const computer = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 4.5,
    dy: 0
};

let playerScore = 0;
let computerScore = 0;

// Input Handling
const keys = {};
let mouseY = canvas.height / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle
function updatePlayer() {
    const moveSpeed = player.speed;
    
    // Keyboard controls (Arrow Keys)
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y = Math.max(0, player.y - moveSpeed);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y = Math.min(canvas.height - player.height, player.y + moveSpeed);
    }
    
    // Mouse movement
    const paddleCenterY = player.y + player.height / 2;
    const distance = mouseY - paddleCenterY;
    
    if (Math.abs(distance) > 5) {
        player.y += distance * 0.1;
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    }
}

// Computer AI
function updateComputer() {
    const computerCenterY = computer.y + computer.height / 2;
    const paddleTopY = computer.y;
    const paddleBottomY = computer.y + computer.height;
    
    // Predictive AI - tries to intercept the ball
    let targetY = ball.y;
    
    // Add some randomness for difficulty
    if (Math.abs(ball.x - computer.x) > 200) {
        targetY += (Math.random() - 0.5) * 30;
    }
    
    // Move paddle towards predicted ball position
    if (computerCenterY < targetY - 10) {
        computer.y = Math.min(canvas.height - computer.height, computer.y + computer.speed);
    } else if (computerCenterY > targetY + 10) {
        computer.y = Math.max(0, computer.y - computer.speed);
    }
}

// Update ball
function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Top and bottom wall collision
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.speedY = -ball.speedY;
        ball.y = ball.y - ball.radius <= 0 ? ball.radius : canvas.height - ball.radius;
    }
    
    // Left and right boundaries (scoring)
    if (ball.x - ball.radius <= 0) {
        computerScore++;
        resetBall();
        updateScore();
    }
    if (ball.x + ball.radius >= canvas.width) {
        playerScore++;
        resetBall();
        updateScore();
    }
    
    // Paddle collision - Player
    if (ball.x - ball.radius <= player.x + player.width &&
        ball.y >= player.y &&
        ball.y <= player.y + player.height &&
        ball.speedX < 0) {
        
        ball.speedX = -ball.speedX;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.speedY += hitPos * 3;
        
        // Increase speed slightly
        ball.speedX *= 1.05;
        ball.speedX = Math.min(ball.speedX, ball.maxSpeed);
    }
    
    // Paddle collision - Computer
    if (ball.x + ball.radius >= computer.x &&
        ball.y >= computer.y &&
        ball.y <= computer.y + computer.height &&
        ball.speedX > 0) {
        
        ball.speedX = -ball.speedX;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.speedY += hitPos * 3;
        
        // Increase speed slightly
        ball.speedX *= 1.05;
        ball.speedX = Math.min(Math.abs(ball.speedX), ball.maxSpeed) * (ball.speedX > 0 ? 1 : -1);
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speedY = (Math.random() - 0.5) * 6;
}

// Update scoreboard
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function drawPaddle(paddle) {
    // Glow effect
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    ctx.shadowBlur = 0;
}

function drawBall() {
    // Glow effect
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw center line
    drawCenterLine();
    
    // Draw elements
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateComputer();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
