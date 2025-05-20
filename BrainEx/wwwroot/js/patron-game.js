document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('pattern-game');
    if (!gameContainer) return;

    const sequenceDisplay = document.getElementById("sequence-display");
    const resultScreen = document.getElementById("result-screen");
    const totalPointsDisplay = document.getElementById("total-points");
    const countdownEl = document.getElementById("countdown");
    const gameUI = document.getElementById("game-container");
    const startScreen = document.getElementById("start-screen");

    const soundCorrect = document.getElementById("sound-correct");
    const soundEnd = document.getElementById("sound-end");

    let sequences = [];
    let index = 0;
    let points = 0;

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
                if (!valid || next > 999) break;
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

        newInput.addEventListener('keydown', (e) => {
            if (!/^\d$/.test(e.key) && e.key !== "Backspace") {
                e.preventDefault();
            }
        });

        newInput.addEventListener('input', () => {
            const value = parseInt(newInput.value);
            const expected = sequences[index].rule;

            if (!isNaN(value)) {
                if (value === expected) {
                    soundCorrect.play();
                    points += 1;
                    index++;
                    if (index >= sequences.length) {
                        endGame();
                    } else {
                        updateSequence();
                    }
                } else if (newInput.value.length >= 3) {
                    points -= 2;
                    newInput.value = '';
                }
            }
        });
    }

    function endGame() {
        const input = document.getElementById("answer-input");
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
                sequences = generateSequenceSet();
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