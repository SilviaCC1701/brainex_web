document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('pattern-game');
    if (!gameContainer) return;

    const sequenceDisplay = document.getElementById("sequence-display");
    const resultScreen = document.getElementById("result-screen");
    const countdownEl = document.getElementById("countdown");
    const gameUI = document.getElementById("game-container");
    const startScreen = document.getElementById("start-screen");

    const soundCorrect = document.getElementById("sound-correct");
    const soundEnd = document.getElementById("sound-end");

    let sequences = [];
    let index = 0;
    let points = 0;

    let attemptsPerSeq = [];
    let timesPerSeq = [];
    let startTime;
    let seqStartTime;

    function generateSequenceSet(count = 10) {
        const allSequences = [];

        while (allSequences.length < count) {
            const ops = ['+', '-', '*'];
            const op = ops[Math.floor(Math.random() * ops.length)];
            const step = Math.floor(Math.random() * 9) + 1;
            const seq = [];
            let start = Math.floor(Math.random() * 10) + 1;
            seq.push(start);

            let valid = true;
            for (let i = 1; i < 5; i++) {
                let next;
                switch (op) {
                    case '+':
                        next = seq[i - 1] + step;
                        break;
                    case '-':
                        next = seq[i - 1] - step;
                        if (next < 0) valid = false;
                        break;
                    case '*':
                        next = seq[i - 1] * step;
                        break;
                }
                if (!valid || next > 99) {
                    valid == false;
                    break;
                }
                seq.push(next);
            }

            if (valid && seq.length === 5) {
                const answer = seq.pop();
                allSequences.push({ seq, rule: answer });
            }
        }

        return allSequences;
    }

    function updateSequence() {
        const current = sequences[index];
        const sequenceHTML = current.seq
            .map(n => `<span class='seq-num'>${n}</span>`)
            .join(" <span class='arrow'>→</span> ");

        sequenceDisplay.innerHTML = `${sequenceHTML} <span class='arrow'>→</span> <input type='text' id='answer-input' maxlength='3' style='font-size: 1.8rem; width: 80px; text-align: center; padding: 5px;' autofocus />`;

        const newInput = document.getElementById("answer-input");
        newInput.value = '';
        newInput.focus();

        seqStartTime = performance.now();
        attemptsPerSeq[index] = 0;

        newInput.addEventListener('keydown', (e) => {
            if (!/^\d$/.test(e.key) && e.key !== "Backspace") {
                e.preventDefault();
            }
        });

        newInput.addEventListener('input', () => {
            const value = newInput.value;
            const expected = sequences[index].rule;

            if (parseInt(value) === expected) {
                attemptsPerSeq[index]++;
                soundCorrect.play();
                const elapsed = performance.now() - seqStartTime;
                timesPerSeq.push(elapsed);
                points += 1;
                index++;
                if (index >= sequences.length) {
                    endGame();
                } else {
                    updateSequence();
                }
            } else {
                const isTwoDigit = expected >= 10;
                if ((isTwoDigit && value.length === 2) || (!isTwoDigit && value.length === 1)) {
                    attemptsPerSeq[index]++;
                    newInput.value = '';
                }
            }
        });
    }

    function endGame() {
        const input = document.getElementById("answer-input");
        if (input) input.style.display = 'none';
        resultScreen.classList.remove('hidden');
        soundEnd.play();

        const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
        const totalAttempts = attemptsPerSeq.reduce((a, b) => a + b, 0);
        const precision = sequences.length > 0 ? ((sequences.length / totalAttempts) * 100).toFixed(1) : '0';
        const perfectSeqs = attemptsPerSeq.filter(a => a === 1).length;
        const avgTime = (timesPerSeq.reduce((a, b) => a + b, 0) / timesPerSeq.length / 1000).toFixed(2);
        const fastest = Math.min(...timesPerSeq) / 1000;
        const slowest = Math.max(...timesPerSeq) / 1000;

        const statsHTML = `
            <div class="stats-summary">
                <p><strong>Tiempo total:</strong> ${totalTime} s</p>
                <p><strong>Media por fase:</strong> ${avgTime} s</p>
                <p><strong>Secuencias totales:</strong> ${sequences.length}</p>
                <p><strong>Aciertos a la primera:</strong> ${perfectSeqs} / ${sequences.length}</p>
                <p><strong>Precisión total:</strong> ${precision}%</p>
                <p><strong>Fallos totales:</strong> ${totalAttempts - sequences.length}</p>
                <p><strong>Intentos totales:</strong> ${totalAttempts}</p>
                <p><strong>Secuencia más rápida:</strong> ${fastest.toFixed(2)} s</p>
                <p><strong>Secuencia más lenta:</strong> ${slowest.toFixed(2)} s</p>
            </div>
            <div class="stats-details">
                <h3>Detalle por secuencia:</h3>
                <ul>
                    ${sequences.map((s, i) => `
                        <li>
                            <strong>${s.seq.join(' → ')}</strong> →
                            ${attemptsPerSeq[i]} intento${attemptsPerSeq[i] > 1 ? 's' : ''},
                            ${(timesPerSeq[i] / 1000).toFixed(2)} s
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div style="max-width:800px; margin:40px auto;">
                <h3 style="text-align:center;">Gráfico: Tiempo por secuencia</h3>
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
                labels: sequences.map((_, i) => `Fase ${i + 1}`),
                datasets: [{
                    label: 'Segundos',
                    data: timesPerSeq.map(t => (t / 1000).toFixed(2)),
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
                            text: 'Fases'
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
                    data: [perfectSeqs, sequences.length - perfectSeqs],
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
            game: "encuentra-patron",
            data: {
                sequences: sequences.map(s => s.seq),
                expectedValues: sequences.map(s => s.rule),
                attemptsPerSeq,
                timesPerSeq: timesPerSeq.map(t => +(t / 1000).toFixed(3))
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
            .then(msg => console.log('✅ Datos enviados al servidor:', msg))
            .catch(err => console.error('❌ Error al enviar datos:', err));
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
                sequences = generateSequenceSet();
                startTime = performance.now();
                updateSequence();
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
