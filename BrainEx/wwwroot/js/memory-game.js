document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('color-memory-game');
    if (!gameContainer) return;

    const startScreen = document.getElementById('start-screen');
    const countdownEl = document.getElementById('countdown');
    const gameUI = document.getElementById('game-container');
    let tiles = Array.from(document.querySelectorAll('.color-tile'));
    const resultScreen = document.getElementById('result-screen');
    const scoreDisplay = document.getElementById('color-score');

    const colors = ['green', 'red', 'yellow', 'blue'];
    let sequence = [];
    let userInput = [];
    let score = 0;
    const maxSequence = 10;

    function startGame() {
        sequence = [];
        userInput = [];
        score = 0;
        resultScreen.classList.add('hidden');
        nextRound();
    }

    function flashTile(color) {
        const tile = document.querySelector(`.color-tile[data-color="${color}"]`);
        if (!tile) return;
        tile.classList.add('active');
        setTimeout(() => tile.classList.remove('active'), 400);
    }

    function playSequence() {
        let delay = 0;
        sequence.forEach((color, index) => {
            setTimeout(() => {
                flashTile(color);
            }, delay);
            delay += 700;
        });
        setTimeout(() => enableInput(), delay);
    }

    function enableInput() {
        userInput = [];
        tiles = Array.from(document.querySelectorAll('.color-tile'));
        tiles.forEach(tile => tile.addEventListener('click', handleClick));
    }

    function disableInput() {
        tiles.forEach(tile => tile.removeEventListener('click', handleClick));
    }

    function handleClick(e) {
        const color = e.currentTarget.dataset.color;
        userInput.push(color);
        flashTile(color);

        const index = userInput.length - 1;
        if (userInput[index] !== sequence[index]) {
            disableInput();
            setTimeout(() => {
                playSequence(); // volver a mostrar la secuencia
            }, 1000);
            return;
        }

        if (userInput.length === sequence.length) {
            disableInput();
            setTimeout(nextRound, 600);
        }
    }

    function nextRound() {
        score = sequence.length;
        if (score >= maxSequence) {
            endGame();
            return;
        }
        const nextColor = colors[Math.floor(Math.random() * colors.length)];
        sequence.push(nextColor);
        playSequence();
    }

    function endGame() {
        scoreDisplay.textContent = score;
        resultScreen.classList.remove('hidden');
    }

    function startCountdown() {
        let count = 3;
        countdownEl.textContent = count;
        countdownEl.classList.remove('hidden');

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.textContent = count;
            } else if (count === 0) {
                countdownEl.textContent = "¡Ya!";
            } else {
                clearInterval(countdownInterval);
                countdownEl.classList.add('hidden');
                gameUI.classList.remove('hidden');
                startGame();
            }
        }, 1000);
    }

    function waitForStart() {
        function handleStart() {
            document.removeEventListener('keydown', handleStart);
            startScreen.classList.add('hidden');
            startCountdown();
        }
        document.addEventListener('keydown', handleStart);
    }

    waitForStart();
});
