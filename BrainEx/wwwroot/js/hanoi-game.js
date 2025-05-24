document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('hanoi-game');
    if (!gameContainer) return;

    const startScreen = document.getElementById("start-screen");
    const countdownEl = document.getElementById("countdown");
    const gameUI = document.getElementById("game-container");
    const resultScreen = document.getElementById("result-screen");
    const pegs = Array.from(document.querySelectorAll('.peg'));

    const totalDisks = 5;
    let selectedDisk = null;
    let moveCount = 0;
    let startTime;

    function setupGame() {
        const colors = ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2196f3'];
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
        if (pegs[1].childElementCount === totalDisks || pegs[2].childElementCount === totalDisks) {
            const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
            resultScreen.classList.remove('hidden');
            resultScreen.innerHTML = `
                <h2>¡Completado!</h2>
                <p>¡Has resuelto la Torre de Hanoi!</p>
                <p>Movimientos: <strong>${moveCount}</strong></p>
                <p>Tiempo total: <strong>${totalTime} segundos</strong></p>
            `;
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
        function handleStart() {
            document.removeEventListener('keydown', handleStart);
            startScreen.classList.add('hidden');
            startCountdown();
        }
        document.addEventListener('keydown', handleStart);
    }

    pegs.forEach(peg => {
        peg.addEventListener('click', handlePegClick);
    });

    waitForStart();
});
