document.addEventListener('DOMContentLoaded', () => {
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

    let startTime;
    let roundStartTime;
    let timesPerRound = [];
    let attemptsPerRound = new Array(totalRounds).fill(0);
    let roundPerfectFlags = new Array(totalRounds).fill(true);

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
            currentCells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('show');
                cell.classList.add('hidden-number');
            });
            roundStartTime = performance.now();
            enableInput();
        }, 2500);
    }

    function enableInput() {
        userSequence = [];
        currentCells.forEach(cell => {
            cell.addEventListener('click', onCellClick, { once: false });
        });
    }

    function disableInput() {
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

        if (!raw || isNaN(number) || number !== expected) {
            score--;
            attemptsPerRound[round]++;
            roundPerfectFlags[round] = false;
            soundError.play();
            disableInput();
            showRedX();
            setTimeout(() => {
                showGrid(true);
            }, 800);
            return;
        }

        cell.textContent = number;
        cell.classList.remove('hidden-number');
        userSequence.push(number);

        if (userSequence.length === sequence.length) {
            score++;
            const timeTaken = performance.now() - roundStartTime;
            timesPerRound.push(timeTaken);
            disableInput();
            setTimeout(() => {
                soundCorrect.play();
                nextRound();
            }, 500);
        }
    }

    function nextRound() {
        round++;
        if (round >= totalRounds) {
            endGame();
        } else {
            showGrid();
        }
    }

    function endGame() {
        grid.innerHTML = '';
        resultScreen.classList.remove('hidden');
        scoreDisplay.textContent = roundPerfectFlags.filter(v => v).length;
        soundEnd.play();

        const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
        const totalFails = attemptsPerRound.reduce((a, b) => a + b, 0);
        const precision = totalRounds > 0 ? ((roundPerfectFlags.filter(v => v).length / totalRounds) * 100).toFixed(1) : '0';

        const statsHTML = `
            <p>Tiempo total: <strong>${totalTime} s</strong></p>
            <p>Tiempo medio por fase: <strong>${(
                timesPerRound.reduce((a, b) => a + b, 0) / timesPerRound.length / 1000
            ).toFixed(2)} s</strong></p>
            <p>Aciertos a la primera: <strong>${roundPerfectFlags.filter(v => v).length} / ${totalRounds}</strong></p>
            <p>Precisión total: <strong>${precision}%</strong></p>
            <p>Fallos totales: <strong>${totalFails}</strong></p>
            <p>Intentos por fase:</p>
            <ul style="text-align: left;">
                ${attemptsPerRound
                .map((a, i) => `<li>Fase ${i + 1}: ${a} fallos</li>`)
                .join('')}
            </ul>
        `;
        resultScreen.insertAdjacentHTML('beforeend', statsHTML);
        // Gráfico de tiempo por ronda
        const ctx = document.getElementById('timeChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: timesPerRound.map((_, i) => `Fase ${i + 1}`),
                datasets: [{
                    label: 'Tiempo (s)',
                    data: timesPerRound.map(t => +(t / 1000).toFixed(2)),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tiempo (s)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Rondas'
                        }
                    }
                }
            }
        });

        // Gráfico de precisión
        const ctx2 = document.getElementById('accuracyChart').getContext('2d');
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Aciertos a la primera', 'Con fallos'],
                datasets: [{
                    data: [roundPerfectFlags.filter(v => v).length, totalRounds - roundPerfectFlags.filter(v => v).length],
                    backgroundColor: ['#4caf50', '#f44336'],
                    borderColor: ['#388e3c', '#c62828'],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });


        const payload = {
            game: "sigue-secuencia",
            data: {
                attemptsPerRound,
                timesPerRound: timesPerRound.map(t => +(t / 1000).toFixed(3)),
                perfectRounds: roundPerfectFlags.map((v, i) => v ? i + 1 : null).filter(v => v !== null)
            }
        };

        fetch('/juegos/enviardatos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
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
                startTime = performance.now();
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
