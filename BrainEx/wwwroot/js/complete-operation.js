﻿document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('complete-operation-game');
    if (!gameContainer) return;

    const prevOp = document.getElementById("prev-operation");
    const currOp = document.getElementById("current-operation");
    const nextOp = document.getElementById("next-operation");
    const resultScreen = document.getElementById("result-screen");
    const countdownEl = document.getElementById("countdown");
    const gameUI = document.getElementById("game-container");

    const soundStart = document.getElementById("sound-start");
    const soundCorrect = document.getElementById("sound-correct");
    const soundEnd = document.getElementById("sound-end");

    let input;
    let operations = [];
    let index = 0;
    let points = 0;
    let startTime;
    let opStartTime;
    let attemptsPerOp = [];
    let timesPerOp = [];

    function generateOperations(count = 10) {
        const ops = [];
        const signs = ['+', '-'];
        for (let i = 0; i < count; i++) {
            const sign = signs[Math.floor(Math.random() * signs.length)];
            const result = Math.floor(Math.random() * 10) + 1;
            const operand = Math.floor(Math.random() * 10) + 1;
            let missing;

            if (sign === '+') {
                missing = result - operand;
            } else {
                missing = result + operand;
            }

            if (missing >= 0 && missing <= 10) {
                ops.push({
                    display: `[?] ${sign} ${operand} = ${result}`,
                    answer: missing
                });
            } else {
                i--; // Reintentar
            }
        }
        return ops;
    }

    function updateOperations() {
        prevOp.textContent = index > 0 ? operations[index - 1].display : '';
        nextOp.textContent = operations[index + 1]?.display || '';

        const opParts = operations[index].display.split('[?]');
        currOp.innerHTML = `
            ${opParts[0]}
            <input type="text" id="answer-input" maxlength="2" autofocus style="font-size: 2.5rem; width: 60px; text-align: center; padding: 5px;" />
            ${opParts[1]}
        `;

        input = document.getElementById("answer-input");
        input.focus();
        opStartTime = performance.now();
        attemptsPerOp[index] = 0;

        input.addEventListener('keydown', (e) => {
            if (!/^\d$/.test(e.key) && e.key !== "Backspace") {
                e.preventDefault();
            }
        });

        input.addEventListener('input', () => {
            const value = parseInt(input.value);
            const correctAnswer = operations[index].answer;
            const isTwoDigitResult = correctAnswer >= 10;

            if (!isNaN(value)) {
                if (value === correctAnswer) {
                    attemptsPerOp[index]++;
                    const elapsed = performance.now() - opStartTime;
                    points += elapsed <= 5000 ? 2 : 1;
                    timesPerOp.push(elapsed);
                    soundCorrect.play();
                    index++;
                    if (index >= operations.length) {
                        endGame();
                    } else {
                        updateOperations();
                    }
                } else if ((isTwoDigitResult && input.value.length === 2) || (!isTwoDigitResult && input.value.length === 1)) {
                    attemptsPerOp[index]++;
                    points -= 1;
                    input.value = '';
                }
            }
        });
    }

    function endGame() {
        currOp.textContent = '';
        nextOp.textContent = '';
        if (input) input.style.display = 'none';
        resultScreen.classList.remove('hidden');
        soundEnd.play();

        const payload = {
            game: "completa_operacion",
            data: {
                operations: operations.map(op => op.display),
                attemptsPerOp,
                timesPerOp: timesPerOp.map(t => +(t / 1000).toFixed(3))
            }
        };

        fetch("/juegos/enviardatos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }).catch(err => {
            console.warn("No se pudo enviar la estadística (no bloqueante):", err);
        });

        const verBtn = document.getElementById("ver-resultados-btn");
        if (verBtn) {
            verBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                try {
                    const res = await fetch("/Juegos/ResultadosTemp", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    });

                    if (res.ok) {
                        window.location.href = "/Juegos/CompletaOperacion/Resultados";
                    } else {
                        console.error("Error al guardar resultados:", await res.text());
                        alert("Hubo un problema al guardar los resultados.");
                    }
                } catch (err) {
                    console.error("Error de red:", err);
                    alert("Error de conexión al enviar los resultados.");
                }
            });
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
                operations = generateOperations();
                startTime = performance.now();
                updateOperations();
            }
        }, 1000);
    }

    function waitForStart() {
        const btnStart = document.querySelector(".btn-play-game");
        if (!btnStart) return;

        btnStart.addEventListener("click", () => {
            document.querySelector(".vista-cec").classList.add("hidden");
            soundStart.play();
            startCountdown();
        });
    }

    waitForStart();
});
