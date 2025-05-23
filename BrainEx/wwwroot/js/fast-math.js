document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('fast-math-game');
    if (!gameContainer) return;

    const prevOp = document.getElementById("prev-operation");
    const currOp = document.getElementById("current-operation");
    const nextOp = document.getElementById("next-operation");
    const input = document.getElementById("answer-input");
    const resultScreen = document.getElementById("result-screen");
    const totalTimeDisplay = document.getElementById("total-time");
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

    function generateOperations(count = 20) {
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
        totalTimeDisplay.textContent = timeElapsed;
        soundEnd.play();

        // Estadísticas
        const totalAttempts = attemptsPerOp.reduce((a, b) => a + b, 0);
        const precision = operations.length > 0 ? ((operations.length / totalAttempts) * 100).toFixed(1) : '0';

        const statsHTML = `
            <p>Tiempo total: <strong>${timeElapsed} s</strong></p>
            <p>Tiempo medio por operación: <strong>${(
                timesPerOp.reduce((a, b) => a + b, 0) / timesPerOp.length / 1000
            ).toFixed(2)} s</strong></p>
            <p>Aciertos a la primera: <strong>${attemptsPerOp.filter(a => a === 1).length} / ${operations.length}</strong></p>
            <p>Precisión total: <strong>${precision}%</strong></p>
            <p>Fallos totales: <strong>${totalAttempts - operations.length}</strong></p>
            <p>Intentos por operación:</p>
            <ul style="text-align: left;">
                ${attemptsPerOp
                .map((attempts, i) => `<li>${operations[i]}: ${attempts - 1} fallos</li>`) // fallos = intentos - 1
                .join('')}
            </ul>
        `;
        resultScreen.insertAdjacentHTML('beforeend', statsHTML);
    }

    input.addEventListener('keydown', (e) => {
        if (!/^\d$/.test(e.key) && e.key !== "Backspace") {
            e.preventDefault();
        }
    });

    input.addEventListener('input', () => {
        const currentResult = evaluate(operations[index]);
        attemptsPerOp[index]++;

        if (parseInt(input.value) === currentResult) {
            soundCorrect.play();
            const timeForOp = performance.now() - opStartTime;
            timesPerOp.push(timeForOp);
            index++;
            if (index >= operations.length) {
                endGame();
            } else {
                updateOperations();
            }
        } else if (input.value.length >= 2) {
            penalty += 2;
            input.value = '';
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
