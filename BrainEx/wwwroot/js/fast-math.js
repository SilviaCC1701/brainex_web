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
        resultScreen.classList.remove("hidden");
        soundEnd.play();

        const payload = {
            game: "calculo_rapido",
            data: {
                operations: operations,
                attemptsPerOp: attemptsPerOp,
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
                        window.location.href = "/Juegos/CalculoRapido/Resultados";
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
