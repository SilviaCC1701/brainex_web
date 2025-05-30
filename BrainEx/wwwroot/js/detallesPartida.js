
    function SolicitarDatosPartida(string tipoPartida, string idPartida) {

    }

    function PintarEstadisticasHanoi(array itemDatos) {
        const resultScreen = document.getElementById("result-screen");
        resultScreen.classList.remove('hidden');
        resultScreen.innerHTML = `
            <h2>¡Completado!</h2>
            <p>¡Has resuelto la Torre de Hanoi!</p>
            <p>Movimientos: <strong>${moveCount}</strong></p>
            <p>Tiempo total: <strong>${totalTime} segundos</strong></p>`;
    }

    function PintarEstadisticas(array itemDatos) {
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
    }

