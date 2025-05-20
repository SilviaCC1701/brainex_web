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
    let startTimestamp;

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
        startTimestamp = performance.now();

        input.addEventListener('keydown', (e) => {
            if (!/^\d$/.test(e.key) && e.key !== "Backspace") {
                e.preventDefault();
            }
        });

        input.addEventListener('input', () => {
            const value = parseInt(input.value);
            const correctAnswer = operations[index].answer;

            if (!isNaN(value)) {
                const elapsed = (performance.now() - startTimestamp) / 1000;
                if (value === correctAnswer) {
                    points += elapsed <= 5 ? 2 : 1;
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