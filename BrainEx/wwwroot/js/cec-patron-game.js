document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('pattern-game-cec');
    if (!gameContainer) return;
    const referrer = document.referrer;
    if (!referrer.includes('/CalcBrainAge/SigueSecuencia')) {
        window.location.href = '/CalcBrainAge';
        return;
    }

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

    function generateSequenceSet(count = 5) {
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

        const times = timesPerSeq.map(t => +(t / 1000).toFixed(3));
        const data = {
            sequences: sequences.map(s => s.seq),
            expectedValues: sequences.map(s => s.rule),
            attemptsPerSeq,
            timesPerSeq: times
        };

        let json = sessionStorage.getItem("CalculoEdadCerebral");
        let parsed;

        try {
            parsed = json ? JSON.parse(json) : {};
        } catch (e) {
            parsed = {};
        }

        parsed.juego3 = data;
        sessionStorage.setItem("CalculoEdadCerebral", JSON.stringify(parsed));
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
