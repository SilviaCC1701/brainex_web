document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('complete-operation-game');
    if (!gameContainer) return;

    const prevOp = document.getElementById("prev-operation");
    const currOp = document.getElementById("current-operation");
    const nextOp = document.getElementById("next-operation");
    const resultScreen = document.getElementById("result-screen");
    const totalPointsDisplay = document.getElementById("total-points");
    const countdownEl = document.getElementById("countdown");
    const gameUI = document.getElementById("game-container");
    const startScreen = document.getElementById("start-screen");

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

    function generateOperations(count = 20) {
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

            if (!isNaN(value)) {
                attemptsPerOp[index]++;
                const elapsed = (performance.now() - opStartTime);

                if (value === correctAnswer) {
                    points += elapsed <= 5000 ? 2 : 1;
                    timesPerOp.push(elapsed);
                    soundCorrect.play();
                    index++;
                    if (index >= operations.length) {
                        endGame();
                    } else {
                        updateOperations();
                    }
                } else if (input.value.length >= 2) {
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
        totalPointsDisplay.textContent = points;
        soundEnd.play();

        const endTime = performance.now();
        const totalTime = ((endTime - startTime) / 1000).toFixed(2);
        const totalAttempts = attemptsPerOp.reduce((a, b) => a + b, 0);
        const precision = operations.length > 0 ? ((operations.length / totalAttempts) * 100).toFixed(1) : '0';

        const statsHTML = `
            <p>Tiempo total: <strong>${totalTime} s</strong></p>
            <p>Tiempo medio por operación: <strong>${(
                timesPerOp.reduce((a, b) => a + b, 0) / timesPerOp.length / 1000
            ).toFixed(2)} s</strong></p>
            <p>Aciertos a la primera: <strong>${attemptsPerOp.filter(a => a === 1).length} / ${operations.length}</strong></p>
            <p>Precisión total: <strong>${precision}%</strong></p>
            <p>Fallos totales: <strong>${totalAttempts - operations.length}</strong></p>
            <p>Fallos por operación:</p>
            <ul style="text-align: left;">
                ${attemptsPerOp
                .map((attempts, i) => `<li>${operations[i].display}: ${attempts - 1} fallos</li>`) // fallos = intentos - 1
                .join('')}
            </ul>
        `;
        resultScreen.insertAdjacentHTML('beforeend', statsHTML);
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
