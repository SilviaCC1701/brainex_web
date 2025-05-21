document.addEventListener('DOMContentLoaded', () => {
    console.log("Juego cargado");

    const gameContainer = document.getElementById('sequence-game');
    if (!gameContainer) return;

    const startScreen = document.getElementById("start-screen");
    const countdownEl = document.getElementById("countdown");
    const gameUI = document.getElementById("game-container");
    const grid = document.getElementById("grid");
    const resultScreen = document.getElementById("result-screen");
    const scoreDisplay = document.getElementById("score");

    const soundCorrect = document.getElementById("sound-correct");
    const soundError = document.getElementById("sound-error");
    const soundEnd = document.getElementById("sound-end");

    let sequence = [];
    let userSequence = [];
    let round = 0;
    let score = 0;
    const totalRounds = 5;
    let currentCells = [];
    let numberMap = {};

    function generatePositions(count = 6) {
        const positions = [];
        const used = new Set();

        while (positions.length < count) {
            const index = Math.floor(Math.random() * 9);
            if (!used.has(index)) {
                used.add(index);
                positions.push(index);
            }
        }
        return positions;
    }

    function showGrid(reuse = false) {
        console.log("Mostrar cuadrícula", { reuse });

        if (!reuse) {
            grid.innerHTML = '';
            grid.className = 'grid-container';
            const cells = Array.from({ length: 9 }, (_, i) => {
                const div = document.createElement('div');
                div.classList.add('grid-cell');
                div.dataset.index = i;
                return div;
            });
            currentCells = cells;
            currentCells.forEach(cell => grid.appendChild(cell));

            const numberCount = Math.floor(Math.random() * 3) + 4;
            const positions = generatePositions(numberCount);
            sequence = [...positions].sort((a, b) => a - b);
            numberMap = {};
            sequence.forEach((pos, idx) => {
                currentCells[pos].textContent = idx + 1;
                currentCells[pos].dataset.number = idx + 1;
                currentCells[pos].classList.add('show');
                numberMap[pos] = idx + 1;
            });
        } else {
            currentCells.forEach(cell => {
                const idx = parseInt(cell.dataset.index);
                const num = numberMap[idx];
                cell.classList.remove('wrong', 'correct');
                if (num) {
                    cell.textContent = num;
                    cell.dataset.number = num;
                    cell.classList.add('show');
                } else {
                    cell.textContent = '';
                    cell.removeAttribute('data-number');
                }
            });
        }

        setTimeout(() => {
            console.log("Ocultando números");
            currentCells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('show');
                cell.classList.add('hidden-number');
            });
            enableInput();
        }, 2500);
    }

    function enableInput() {
        console.log("Habilitando input");
        userSequence = [];
        currentCells.forEach(cell => {
            cell.addEventListener('click', onCellClick, { once: false });
        });
    }

    function disableInput() {
        console.log("Deshabilitando input");
        currentCells.forEach(cell => {
            const newCell = cell.cloneNode(true);
            newCell.className = cell.className;
            newCell.dataset.index = cell.dataset.index;
            if (cell.dataset.number) {
                newCell.dataset.number = cell.dataset.number;
            } else {
                delete newCell.dataset.number;
            }
            grid.replaceChild(newCell, cell);
        });
        currentCells = Array.from(grid.querySelectorAll('.grid-cell'));
    }

    function showRedX() {
        const xPattern = [0, 2, 4, 6, 8];
        currentCells.forEach((cell, idx) => {
            if (xPattern.includes(idx)) {
                cell.classList.add('wrong');
            }
        });
    }

    function onCellClick(e) {
        const cell = e.currentTarget;
        const raw = cell.dataset.number;
        const number = raw ? parseInt(raw) : NaN;
        const expected = userSequence.length + 1;

        console.log("Clic en celda", { number, expected });

        if (!raw || isNaN(number) || number !== expected) {
            console.log("Error en secuencia");
            score--;
            soundError.play();
            disableInput();
            showRedX();
            setTimeout(() => {
                console.log("Reintentando la misma secuencia");
                showGrid(true);
            }, 800);
            return;
        }

        cell.textContent = number;
        cell.classList.remove('hidden-number');
        userSequence.push(number);

        if (userSequence.length === sequence.length) {
            console.log("Secuencia completa");
            score++;
            disableInput();
            setTimeout(() => {
                soundCorrect.play();
                nextRound();
            }, 500);
        }
    }

    function nextRound() {
        round++;
        console.log("Siguiente ronda", { round });
        if (round >= totalRounds) {
            endGame();
        } else {
            showGrid();
        }
    }

    function endGame() {
        console.log("Fin del juego");
        grid.innerHTML = '';
        resultScreen.classList.remove('hidden');
        scoreDisplay.textContent = score;
        soundEnd.play();
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
                showGrid();
            }
        }, 1000);
    }

    function waitForStart() {
        function startGame() {
            document.removeEventListener('keydown', startGame);
            startScreen.classList.add('hidden');
            startCountdown();
        }
        document.addEventListener('keydown', startGame);
    }

    waitForStart();
});