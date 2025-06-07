document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('pattern-game');
    if (!gameContainer) return;

    const sequenceDisplay = document.getElementById("sequence-display");
    const resultScreen = document.getElementById("result-screen");
    const countdownEl = document.getElementById("countdown");
    const gameUI = document.getElementById("game-container");
    const startScreen = document.getElementById("start-screen");

    const soundCorrect = document.getElementById("sound-correct");
    const soundStart = document.getElementById("sound-start");
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
        lanzarConfetiDesdeEsquinas();

        const payload = {
            game: "encuentra_patron",
            data: {
                sequences: sequences.map(s => s.seq),
                expectedValues: sequences.map(s => s.rule),
                attemptsPerSeq,
                timesPerSeq: timesPerSeq.map(t => +(t / 1000).toFixed(3))
            }
        };

        fetch("/juegos/enviardatos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).catch(err => {
            console.warn("No se pudo enviar la estadística:", err);
        });

        const verBtn = document.getElementById("ver-resultados-btn");
        if (verBtn) {
            verBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                try {
                    const res = await fetch("/Juegos/ResultadosTemp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });

                    if (res.ok) {
                        window.location.href = "/Juegos/EncuentraPatron/Resultados";
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
                sequences = generateSequenceSet();
                startTime = performance.now();
                updateSequence();
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
