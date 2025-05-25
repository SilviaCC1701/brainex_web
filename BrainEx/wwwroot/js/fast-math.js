document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('fast-math-game');
    if (!gameContainer) return;

    const prevOp = document.getElementById("prev-operation");
    const currOp = document.getElementById("current-operation");
    const nextOp = document.getElementById("next-operation");
    const input = document.getElementById("answer-input");
    const resultScreen = document.getElementById("result-screen");
    const countdownEl = document.getElementById("countdown");
    const gameUI = document.getElementById("game-container");
    const startScreen = document.getElementById("start-screen");

    const soundStart = document.getElementById("sound-start");
    const soundCorrect = document.getElementById("sound-correct");
    const soundEnd = document.getElementById("sound-end");

    let operations = [];
    let index = 0;
    let startTime;
    let penalty = 0;

    let attemptsPerOp = [];
    let timesPerOp = [];
    let opStartTime;

    function generateOperations(count = 10) {
        const ops = [];
        const signs = ['+', '-'];
        for (let i = 0; i < count; i++) {
            let num1 = Math.floor(Math.random() * 10) + 1;
            let num2 = Math.floor(Math.random() * 10) + 1;
            const sign = signs[Math.floor(Math.random() * signs.length)];

            if (sign === '-' && num1 < num2) {
                [num1, num2] = [num2, num1];
            }

            ops.push(`${num1} ${sign} ${num2}`);
        }
        return ops;
    }

    function evaluate(op) {
        return Function('"use strict"; return (' + op + ')')();
    }

    function updateOperations() {
        prevOp.textContent = index > 0 ? operations[index - 1] : '';
        currOp.textContent = operations[index] + ' =';
        nextOp.textContent = operations[index + 1] || '';
        input.value = '';
        attemptsPerOp[index] = 0;
        opStartTime = performance.now();
    }

    function endGame() {
        const endTime = performance.now();
        const timeElapsed = ((endTime - startTime) / 1000).toFixed(2);
        currOp.textContent = '';
        nextOp.textContent = '';
        input.style.display = 'none';
        resultScreen.classList.remove('hidden');
        soundEnd.play();

        const avgTime = (timesPerOp.reduce((a, b) => a + b, 0) / timesPerOp.length / 1000).toFixed(2);
        const totalAttempts = attemptsPerOp.reduce((a, b) => a + b, 0);
        const totalFails = totalAttempts - operations.length;
        const fastestTime = Math.min(...timesPerOp) / 1000;
        const slowestTime = Math.max(...timesPerOp) / 1000;
        const precision = ((operations.length / totalAttempts) * 100).toFixed(1);
        const perfectOps = attemptsPerOp.filter(a => a === 1).length;

        const statsHTML = `
        <div class="stats-summary">
            <p><strong>Tiempo total:</strong> ${timeElapsed} segundos</p>
            <p><strong>Media por operación:</strong> ${avgTime} segundos</p>
            <p><strong>Operaciones totales:</strong> ${operations.length}</p>
            <p><strong>Aciertos a la primera:</strong> ${perfectOps} / ${operations.length}</p>
            <p><strong>Precisión total:</strong> ${precision}%</p>
            <p><strong>Fallos totales:</strong> ${totalFails}</p>
            <p><strong>Intentos totales:</strong> ${totalAttempts}</p>
            <p><strong>Operación más rápida:</strong> ${fastestTime.toFixed(2)} s</p>
            <p><strong>Operación más lenta:</strong> ${slowestTime.toFixed(2)} s</p>
        </div>
        <div class="stats-details">
            <h3>Detalle por operación:</h3>
            <ul>
                ${operations.map((op, i) => `
                    <li>
                        <strong>${op}</strong> → 
                        ${attemptsPerOp[i]} intento${attemptsPerOp[i] > 1 ? 's' : ''}, 
                        ${(timesPerOp[i] / 1000).toFixed(2)} s
                    </li>
                `).join('')}
            </ul>
        </div>
        <div style="max-width:800px; margin:40px auto;">
            <h3 style="text-align:center;">Gráfico: Tiempo por operación</h3>
            <canvas id="timeChart" height="200"></canvas>
        </div>
        <div style="max-width:500px; margin:40px auto;">
            <h3 style="text-align:center;">Distribución de aciertos</h3>
            <canvas id="accuracyChart" height="200"></canvas>
        </div>
    `;

        const container = document.createElement('div');
        container.id = "result-stats";
        container.innerHTML = statsHTML;
        resultScreen.appendChild(container);

        const ctx = document.getElementById('timeChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: operations.map((_, i) => `Op ${i + 1}`),
                datasets: [{
                    label: 'Segundos',
                    data: timesPerOp.map(t => (t / 1000).toFixed(2)),
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
                            text: 'Operaciones'
                        }
                    }
                }
            }
        });

        const ctx2 = document.getElementById('accuracyChart').getContext('2d');
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Aciertos a la primera', 'Con fallos'],
                datasets: [{
                    data: [perfectOps, operations.length - perfectOps],
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
            game: "calculo-rapido",
            data: {
                operations,
                attemptsPerOp,
                timesPerOp: timesPerOp.map(t => +(t / 1000).toFixed(3))
            }
        };

        fetch('/juegos/enviardatos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(res => res.ok ? res.text() : Promise.reject(res.statusText))
            .then(msg => console.log('Datos enviados al servidor:', msg))
            .catch(err => console.error('Error al enviar datos:', err));

    }

    input.addEventListener('keydown', (e) => {
        if (!/^\d$/.test(e.key) && e.key !== "Backspace") {
            e.preventDefault();
        }
    });

    input.addEventListener('input', () => {
        const value = input.value;
        const currentResult = evaluate(operations[index]);

        if (parseInt(value) === currentResult) {
            attemptsPerOp[index]++;
            soundCorrect.play();
            const timeForOp = performance.now() - opStartTime;
            timesPerOp.push(timeForOp);
            index++;
            if (index >= operations.length) {
                endGame();
            } else {
                updateOperations();
            }
        } else {
            const isTwoDigitResult = currentResult >= 10;
            if ((isTwoDigitResult && value.length === 2) || (!isTwoDigitResult && value.length === 1)) {
                attemptsPerOp[index]++;
                penalty += 2;
                input.value = '';
            }
        }
    });

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
                operations = generateOperations();
                updateOperations();
                startTime = performance.now();
            }
        }, 1000);
    }

    function waitForStart() {
        function startGame() {
            document.removeEventListener('keydown', startGame);
            startScreen.classList.add('hidden');
            soundStart.play();
            startCountdown();
        }
        document.addEventListener('keydown', startGame);
    }

    waitForStart();
});
