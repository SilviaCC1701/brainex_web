window.lanzarConfetiDesdeEsquinas = function (canvasId = 'confetti-canvas') {
    const $canvas = $('#' + canvasId);
    if ($canvas.length === 0) {
        console.warn(`No se encontró el canvas con id '${canvasId}'`);
        return;
    }

    const canvas = $canvas[0];
    const confettiInstance = confetti.create(canvas, {
        resize: true,
        useWorker: true
    });

    confettiInstance({
        particleCount: 150,
        spread: 120,
        angle: 60,
        origin: { x: 0, y: 1 },
        startVelocity: 60,
        scalar: 1.5
    });


    confettiInstance({
        particleCount: 150,
        spread: 120,
        angle: 120,
        origin: { x: 1, y: 1 },
        startVelocity: 60,
        scalar: 1.5
    });

};
