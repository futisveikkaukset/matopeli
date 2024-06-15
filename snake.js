const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const originalPlayArea = {
    x1: 138,
    y1: 109,
    x2: 788,
    y2: 606,
    width: 788 - 138,
    height: 606 - 109
};

let playArea = {...originalPlayArea};

const gridSize = 20;
let snake = [];
let direction = {x: gridSize, y: 0};
let food = {};
let score = 0;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
let gameRunning = false;
let countdown = 3; // Laskuriarvo

// Load background image
const backgroundImage = new Image();
backgroundImage.src = 'pelialue.png';
backgroundImage.onload = function() {
    resizeCanvas();
    startCountdown();
};

function startCountdown() {
    const countdownInterval = setInterval(() => {
        drawCountdown();
        countdown--;
        if (countdown < 0) {
            clearInterval(countdownInterval);
            startGame();
        }
    }, 1000);
}

function drawCountdown() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Game starts in ${countdown}`, canvas.width / 2, canvas.height / 2);
}

function startGame() {
    resetGame(); // Ensure the game is reset before starting
    gameRunning = true;
    gameLoop();
}

function gameLoop() {
    if (gameRunning) {
        update();
        draw();
        setTimeout(gameLoop, 100);
    }
}

function update() {
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

    if (head.x === food.x && head.y === food.y) {
        snake.push({});
        score++;
        placeFood();
    }

    for (let i = snake.length - 1; i > 0; i--) {
        snake[i] = {...snake[i - 1]};
    }
    snake[0] = head;

    if (head.x < playArea.x1 || head.y < playArea.y1 || head.x >= playArea.x2 || head.y >= playArea.y2 || snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(playArea.x1, playArea.y1, playArea.width, playArea.height);

    ctx.fillStyle = '#0f0';
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, gridSize, gridSize));

    ctx.fillStyle = '#f00';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);

    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${score}`, 10, 20);
}

function changeDirection(event) {
    const keyMap = {
        'ArrowUp': {x: 0, y: -gridSize},
        'ArrowDown': {x: 0, y: gridSize},
        'ArrowLeft': {x: -gridSize, y: 0},
        'ArrowRight': {x: gridSize, y: 0}
    };

    if (keyMap[event.key] && (keyMap[event.key].x !== -direction.x || keyMap[event.key].y !== -direction.y)) {
        direction = keyMap[event.key];
    }
}

function resetGame() {
    snake = [{x: playArea.x1 + gridSize * 5, y: playArea.y1 + gridSize * 5}];
    direction = {x: gridSize, y: 0};
    score = 0;
    placeFood();
    gameRunning = false;
    document.getElementById('gameOverModal').style.display = 'none';
}

function endGame() {
    gameRunning = false;
    document.getElementById('finalScore').innerText = score;
    document.getElementById('gameOverModal').style.display = 'block';
}

function saveScore() {
    const playerName = document.getElementById('playerName').value;
    if (playerName) {
        highScores.push({ name: playerName, score: score });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 10);
        localStorage.setItem('highScores', JSON.stringify(highScores));
        updateHighScores();
        resetGame();
    }
}

function updateHighScores() {
    const scoreList = document.getElementById('scoreList');
    scoreList.innerHTML = '';
    highScores.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name}: ${player.score}`;
        scoreList.appendChild(li);
    });
}

function placeFood() {
    food = {
        x: playArea.x1 + Math.floor(Math.random() * playArea.width / gridSize) * gridSize,
        y: playArea.y1 + Math.floor(Math.random() * playArea.height / gridSize) * gridSize
    };
}

function startNewGame() {
    document.getElementById('gameOverModal').style.display = 'none';
    countdown = 3;
    startCountdown();
}

document.addEventListener('keydown', changeDirection);
document.addEventListener('keydown', function(event) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
    }
});
window.addEventListener('resize', resizeCanvas);
updateHighScores();

const touchArea = document.getElementById('touchArea');
touchArea.addEventListener('touchstart', handleTouch);
touchArea.addEventListener('touchmove', handleTouch);

function handleTouch(event) {
    const touch = event.touches[0];
    const rect = touchArea.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (x < 50) {
        changeDirection({key: 'ArrowLeft'});
    } else if (x > 100) {
        changeDirection({key: 'ArrowRight'});
    } else if (y < 50) {
        changeDirection({key: 'ArrowUp'});
    } else if (y > 100) {
        changeDirection({key: 'ArrowDown'});
    }

    event.preventDefault();
}

function resizeCanvas() {
    const scale = Math.min(window.innerWidth / 920, window.innerHeight / 720);
    canvas.width = 920 * scale;
    canvas.height = 720 * scale;

    playArea = {
        x1: originalPlayArea.x1 * scale,
        y1: originalPlayArea.y1 * scale,
        x2: originalPlayArea.x2 * scale,
        y2: originalPlayArea.y2 * scale,
        width: originalPlayArea.width * scale,
        height: originalPlayArea.height * scale
    };

    // Scale snake and food positions
    snake = snake.map(segment => ({
        x: segment.x * scale,
        y: segment.y * scale
    }));
    food = {
        x: food.x * scale,
        y: food.y * scale
    };
}
