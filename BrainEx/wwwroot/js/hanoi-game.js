document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('hanoi-game');
    if (!gameContainer) return;

    const startScreen = document.getElementById("start-screen");
    const countdownEl = document.getElementById("countdown");
    const gameUI = document.getElementById("game-container");
    const resultScreen = document.getElementById("result-screen");
    const pegs = Array.from(document.querySelectorAll('.peg'));

    const soundStart = document.getElementById("sound-start");
    const soundEnd = document.getElementById("sound-end");

    const totalDisks = 5;
    let selectedDisk = null;
    let moveCount = 0;
    let startTime;

    function setupGame() {
        const colors = ['#6EB5FF', '#CFA1FF', '#42FF99', '#FFE866', '#FF9E8D'];
        pegs.forEach(peg => peg.innerHTML = '');
        for (let i = 1; i <= totalDisks; i++) {
            const disk = document.createElement('div');
            disk.classList.add('disk');
            disk.dataset.size = i;
            disk.style.width = `${60 + i * 20}px`;
            disk.style.backgroundColor = colors[i - 1];
            disk.textContent = i;
            disk.style.margin = '0 auto';
            pegs[0].prepend(disk);
        }
        moveCount = 0;
        startTime = performance.now();
    }

    function isTopDisk(disk) {
        return disk.parentElement.lastElementChild === disk;
    }

    function handlePegClick(e) {
        const peg = e.currentTarget;
        const topDisk = peg.lastElementChild;

        if (selectedDisk) {
            if (selectedDisk === topDisk) {
                selectedDisk.classList.remove('selected');
                selectedDisk = null;
                return;
            }

            const movingSize = parseInt(selectedDisk.dataset.size);
            const targetSize = topDisk ? parseInt(topDisk.dataset.size) : Infinity;

            if (movingSize < targetSize) {
                peg.appendChild(selectedDisk);
                selectedDisk.classList.remove('selected');
                selectedDisk = null;
                moveCount++;
                checkWin();
            }
        } else if (topDisk && topDisk.classList.contains('disk')) {
            if (isTopDisk(topDisk)) {
                selectedDisk = topDisk;
                topDisk.classList.add('selected');
            }
        }
    }

    function checkWin() {
        const isWin =
            pegs[1].querySelectorAll('.disk').length === totalDisks ||
            pegs[2].querySelectorAll('.disk').length === totalDisks;

        if (!isWin) return;

        soundEnd.play();
        lanzarConfetiDesdeEsquinas();
        const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
        resultScreen.classList.remove('hidden');

        const payload = {
            game: "torre_hanoi",
            data: {
                totalDisks,
                moveCount,
                timeElapsed: +totalTime,
                optimalMoves: Math.pow(2, totalDisks) - 1,
                efficiency: +((Math.pow(2, totalDisks) - 1) / moveCount * 100).toFixed(1)
            }
        };

        fetch('/juegos/enviardatos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
                        window.location.href = "/Juegos/TorreHanoi/Resultados";
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
                setupGame();
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

    pegs.forEach(peg => {
        peg.addEventListener('click', handlePegClick);
    });

    waitForStart();
});
