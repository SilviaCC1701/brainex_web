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
        scoreDisplay.textContent = score;
        resultScreen.classList.remove('hidden');

        const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
        const totalFails = attemptsPerRound.reduce((a, b) => a + b, 0);
        const precision = maxSequence > 0 ? ((roundPerfectFlags.filter(v => v).length / maxSequence) * 100).toFixed(1) : '0';
        const avgTime = (timesPerRound.reduce((a, b) => a + b, 0) / timesPerRound.length / 1000).toFixed(2);

        const statsHTML = `
        <div class="stats-summary">
            <p><strong>Tiempo total:</strong> ${totalTime} segundos</p>
            <p><strong>Media por fase:</strong> ${avgTime} segundos</p>
            <p><strong>Secuencias perfectas:</strong> ${roundPerfectFlags.filter(v => v).length} / ${maxSequence}</p>
            <p><strong>Precisión:</strong> ${precision}%</p>
            <p><strong>Fallos totales:</strong> ${totalFails}</p>
        </div>
        <div class="stats-details">
            <h3>Intentos por fase:</h3>
            <ul>
                ${attemptsPerRound
                .map((a, i) => `<li>Fase ${i + 1}: ${a} fallos</li>`)
                .join('')}
            </ul>
        </div>
        <div style="max-width:800px; margin:40px auto;">
            <h3 style="text-align:center;">Gráfico: Tiempo por ronda</h3>
            <canvas id="timeChart" height="200"></canvas>
        </div>
        <div style="max-width:500px; margin:40px auto;">
            <h3 style="text-align:center;">Distribución de aciertos</h3>
            <canvas id="accuracyChart" height="200"></canvas>
        </div>
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
                    data: timesPerRound.map(t => (t / 1000).toFixed(2)),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Tiempo (s)' }
                    },
                    x: {
                        title: { display: true, text: 'Ronda' }
                    }
                }
            }
        });

        // Gráfico de precisión
        const ctx2 = document.getElementById('accuracyChart').getContext('2d');
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Perfectas', 'Con fallos'],
                datasets: [{
                    data: [roundPerfectFlags.filter(v => v).length, maxSequence - roundPerfectFlags.filter(v => v).length],
                    backgroundColor: ['#4caf50', '#f44336'],
                    borderColor: ['#388e3c', '#c62828'],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        // Enviar los datos crudos al servidor
        const payload = {
            game: "memory-game",
            data: {
                attemptsPerRound,
                timesPerRound: timesPerRound.map(t => +(t / 1000).toFixed(3)),
                perfectRounds: roundPerfectFlags.map((v, i) => v ? i + 1 : null).filter(v => v !== null)
            }
        };

        fetch('/juegos/enviardatos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(res => res.ok ? res.text() : Promise.reject(res.statusText))
            .then(msg => console.log("✅ Datos enviados:", msg))
            .catch(err => console.error("❌ Error al enviar datos:", err));
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
