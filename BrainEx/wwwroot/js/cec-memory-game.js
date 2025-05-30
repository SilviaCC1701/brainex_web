document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('color-memory-game-cec');
    if (!gameContainer) return;
    const referrer = document.referrer;
    if (!referrer.includes('/CalcBrainAge/EncuentraPatron')) {
        window.location.href = '/CalcBrainAge';
        return;
    }

    const startScreen = document.getElementById('start-screen');
    const countdownEl = document.getElementById('countdown');
    const gameUI = document.getElementById('game-container');
    let tiles = Array.from(document.querySelectorAll('.color-tile'));
    const resultScreen = document.getElementById('result-screen');
    const soundEnd = document.getElementById("sound-end");

    const colors = ['green', 'red', 'yellow', 'blue'];
    let sequence = [];
    let userInput = [];
    let score = 0;
    const maxSequence = 5;

    let startTime;
    let roundStartTime;
    let currentRound = 0;
    let timesPerRound = [];
    let attemptsPerRound = new Array(maxSequence).fill(0);
    let roundPerfectFlags = new Array(maxSequence).fill(true);

    function startGame() {
        sequence = [];
        userInput = [];
        score = 0;
        currentRound = 0;
        timesPerRound = [];
        attemptsPerRound.fill(0);
        roundPerfectFlags.fill(true);
        resultScreen.classList.add('hidden');
        startTime = performance.now();
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
        setTimeout(() => {
            roundStartTime = performance.now();
            enableInput();
        }, delay);
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
            attemptsPerRound[currentRound]++;
            roundPerfectFlags[currentRound] = false;
            setTimeout(() => {
                playSequence();
            }, 1000);
            return;
        }

        if (userInput.length === sequence.length) {
            disableInput();
            timesPerRound.push(performance.now() - roundStartTime);
            score = sequence.length;
            currentRound++;
            if (score >= maxSequence) {
                endGame();
            } else {
                setTimeout(nextRound, 600);
            }
        }
    }
    function nextRound() {
        const nextColor = colors[Math.floor(Math.random() * colors.length)];
        sequence.push(nextColor);
        playSequence();
    }

    function endGame() {
        resultScreen.classList.remove('hidden');
        soundEnd.play();

        const payload = {
            attemptsPerRound,
            timesPerRound: timesPerRound.map(t => +(t / 1000).toFixed(3)),
            perfectRounds: roundPerfectFlags.map((v, i) => v ? i + 1 : null).filter(Boolean)
        };

        const now = new Date().toISOString();
        const data = {
            fechaInicio: null,
            fechaFin: null,
            juego1: null,
            juego2: null,
            juego3: null,
            juego4: payload,
            juego5: null,
            juego6: null
        };

        const existing = sessionStorage.getItem("CalculoEdadCerebral");
        if (existing) {
            const json = JSON.parse(existing);
            json.juego4 = payload;
            sessionStorage.setItem("CalculoEdadCerebral", JSON.stringify(json));
        } else {
            data.fechaInicio = now;
            sessionStorage.setItem("CalculoEdadCerebral", JSON.stringify(data));
        }
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
