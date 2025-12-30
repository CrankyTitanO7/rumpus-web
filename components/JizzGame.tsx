import React, { useEffect, useRef, useState } from "react";

export default function PowerJumpGame() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);

    const width = 800;
    const height = 500;
    const groundY = height - 80;
    const birdX = 160;
    const birdRadius = 18;
    const pipeSpacing = 50;
    const groundHeight = 80;

    const birdImgRef = useRef<HTMLImageElement | null>(null);
    const eyeImgRef = useRef<HTMLImageElement | null>(null);
    const bgImgRef = useRef<HTMLImageElement | null>(null);
    const sparkImgRef = useRef<HTMLImageElement | null>(null);

    const [tick, setTick] = useState(0);

    interface Effect {
        x: number;
        y: number;
        timer: number;
        duration: number;
        power: number;
    }

    const stateRef = useRef({
        birdY: groundY - birdRadius,
        vy: 0,
        gravity: 1400,
        onGround: true,
        powerActive: true,
        powerPos: 0.5,
        powerDir: 1,
        pipes: [] as Array<{ x: number; height: number; passed: boolean }>,
        nextPipeX: width + 60,
        score: 0,
        highScore: 0,
        alive: true,
        prepTime: 0,
        eyeOffset: 0,
        preparingJump: false,
        jumpEffects: [] as Effect[],
        jumpCount: 0,
        blueTint: 0, // <-- ADDED
    });

    useEffect(() => {
        birdImgRef.current = new Image();
        birdImgRef.current.src = "/bird.png";
        eyeImgRef.current = new Image();
        eyeImgRef.current.src = "/eye.png";
        bgImgRef.current = new Image();
        bgImgRef.current.src = "/background.png";
        sparkImgRef.current = new Image();
        sparkImgRef.current.src = "/spark.png";
    }, []);

    function resetGame() {
        const s = stateRef.current;
        s.birdY = groundY - birdRadius;
        s.vy = 0;
        s.onGround = true;
        s.powerActive = true;
        s.powerPos = 0.5;
        s.powerDir = 1;
        s.pipes = [];
        s.nextPipeX = width + 60;
        s.score = 0;
        s.alive = true;
        s.prepTime = 0;
        s.eyeOffset = 0;
        s.preparingJump = false;
        s.jumpEffects = [];
        s.jumpCount = 0;
        s.blueTint = 0; // <-- ADDED
        setTick((t) => t + 1);
    }

    function toggleFullscreen() {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => {
                console.error(`Error enabling fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    function jumpWithPower(p: number) {
        const s = stateRef.current;
        if (!s.alive) return;

        const closeness = 1 - Math.min(1, Math.abs(p - 0.5) * 2);
        const minJump = 420;
        const maxJump = 920;
        s.vy = -(minJump + (maxJump - minJump) * closeness);
        s.onGround = false;
        s.powerActive = false;
        s.preparingJump = false;

        s.jumpCount++;
        s.blueTint = Math.min(0.6, s.blueTint + 0.15); // <-- ADDED
    }

    useEffect(() => {
        function triggerAction() {
            const s = stateRef.current;
            if (s.powerActive) {
                s.preparingJump = true;
                s.prepTime = 0;

                const closeness =
                    1 - Math.min(1, Math.abs(s.powerPos - 0.5) * 2);
                const effectDuration = 0.3 + closeness * 1.2;

                s.jumpEffects.push({
                    x: birdX,
                    y: s.birdY + birdRadius,
                    timer: 0,
                    duration: effectDuration,
                    power: closeness,
                });
            } else if (!s.alive) {
                resetGame();
            }
        }

        function onKey(e: KeyboardEvent) {
            if (e.code === "Space") triggerAction();
        }

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current!;
        canvas.width = width;
        canvas.height = height;

        function spawnPipe() {
            const s = stateRef.current;
            const maxHeight = groundY - 40;
            let h = 40 + (s.score % 10) * 40;
            if (h > maxHeight) h = maxHeight;
            s.pipes.push({ x: s.nextPipeX, height: h, passed: false });
            s.nextPipeX += pipeSpacing;
        }

        function loop(t: number) {
            if (!lastTimeRef.current) lastTimeRef.current = t;
            const dt = Math.min(0.05, (t - lastTimeRef.current) / 1000);
            lastTimeRef.current = t;

            const ctx = canvas.getContext("2d")!;
            ctx.clearRect(0, 0, width, height);

            const s = stateRef.current;

            // --- Update power bar ---
            if (s.powerActive && !s.preparingJump) {
                const speedFactor = Math.sin(s.powerPos * Math.PI) * 1.2 + 0.1;
                s.powerPos += s.powerDir * dt * 0.8 * speedFactor;
                if (s.powerPos >= 1) {
                    s.powerPos = 1;
                    s.powerDir = -1;
                } else if (s.powerPos <= 0) {
                    s.powerPos = 0;
                    s.powerDir = 1;
                }
            }

            // --- Jump prep ---
            if (s.preparingJump) {
                s.prepTime += dt;
                s.eyeOffset = Math.sin(t * 50) * 3;
                if (s.prepTime >= 0.25) jumpWithPower(s.powerPos);
            } else {
                s.eyeOffset = 0;
            }

            // --- Fade tint over time ---
            s.blueTint = Math.max(0, s.blueTint - dt * 0.025); // <-- ADDED

            if (s.alive && s.pipes.length === 0) spawnPipe();

            const pipeSpeed = s.onGround || !s.alive ? 0 : 240 + s.score * 6;

            for (let i = s.pipes.length - 1; i >= 0; i--) {
                s.pipes[i].x -= pipeSpeed * dt;
                if (
                    !s.pipes[i].passed &&
                    s.pipes[i].x + 48 < birdX - birdRadius
                ) {
                    s.pipes[i].passed = true;
                    s.score++;
                    if (s.score > s.highScore) s.highScore = s.score;
                    setTick((t) => t + 1);
                    if (s.pipes[i].x + pipeSpacing < width) spawnPipe();
                }
                if (s.pipes[i].x < -120) s.pipes.splice(i, 1);
            }

            if (!s.onGround && s.alive && !s.preparingJump) {
                s.vy += s.gravity * dt;
                s.birdY += s.vy * dt;
                if (s.birdY >= groundY - birdRadius) {
                    s.birdY = groundY - birdRadius;
                    s.vy = 0;
                    s.onGround = true;
                    s.powerActive = true;
                }
            }

            // --- Collision ---
            for (const pipe of s.pipes) {
                const w = 56;
                const h = pipe.height;
                const px = pipe.x,
                    py = groundY - h;
                const nx = Math.max(px, Math.min(birdX, px + w));
                const ny = Math.max(py, Math.min(s.birdY, py + h));
                const dx = birdX - nx;
                const dy = s.birdY - ny;
                if (dx * dx + dy * dy < birdRadius * birdRadius && s.alive) {
                    s.alive = false;
                    s.vy = 0;
                    s.onGround = false;
                    s.powerActive = false;
                    setTick((t) => t + 1);
                }
            }

            // --- DRAWING ORDER ---

            if (bgImgRef.current)
                ctx.drawImage(bgImgRef.current, 0, 0, width, height);

            for (const pipe of s.pipes) {
                const w = 56;
                const h = pipe.height;
                ctx.fillStyle = "#2f9e44";
                ctx.fillRect(pipe.x, groundY - h, w, h);
                ctx.fillStyle = "#1f6b2e";
                ctx.fillRect(pipe.x + w - 14, groundY - h, 14, h);
            }

            ctx.fillStyle = "#654321";
            ctx.fillRect(0, groundY, width, groundHeight);

            ctx.fillStyle = "#555";
            ctx.fillRect(0, groundY, width, 4);

            for (let i = s.jumpEffects.length - 1; i >= 0; i--) {
                const e = s.jumpEffects[i];
                e.timer += dt;

                const alpha = 1 - e.timer / e.duration;
                if (alpha <= 0) {
                    s.jumpEffects.splice(i, 1);
                    continue;
                }

                const size = 40 + e.power * 60;

                if (sparkImgRef.current) {
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(
                        sparkImgRef.current,
                        e.x - size / 2,
                        e.y - size / 4,
                        size,
                        size
                    );
                    ctx.globalAlpha = 1;
                }
            }

            // --- BIRD ---
            if (birdImgRef.current) {
                ctx.drawImage(
                    birdImgRef.current,
                    birdX - 18,
                    s.birdY - 18,
                    42,
                    42
                );

                // 🔵 Blue tint overlay
                if (s.blueTint > 0) {
                    ctx.globalCompositeOperation = "source-atop";
                    ctx.fillStyle = `rgba(50,150,255,${s.blueTint})`;
                    ctx.fillRect(birdX - 18, s.birdY - 18, 42, 42);
                    ctx.globalCompositeOperation = "source-over";
                }
            } else {
                ctx.beginPath();
                ctx.arc(birdX, s.birdY, birdRadius, 0, Math.PI * 2);
                ctx.fillStyle = "yellow";
                ctx.fill();
            }

            if (eyeImgRef.current)
                ctx.drawImage(
                    eyeImgRef.current,
                    birdX + 2,
                    s.birdY - 5 + s.eyeOffset,
                    36,
                    36
                );

            ctx.font = "28px Inter, system-ui, sans-serif";
            ctx.fillStyle = "#fff";
            ctx.fillText(`Score: ${s.score}`, 18, 34);
            ctx.fillText(`High: ${s.highScore}`, 18, 64);

            if (s.powerActive) {
                const barW = 200;
                const barH = 18;
                const bx = width - barW - 24;
                const by = height - 60;

                ctx.fillStyle = "rgba(255,255,255,0.12)";
                ctx.fillRect(bx, by, barW, barH);

                ctx.fillStyle = "rgba(255,255,255,0.08)";
                ctx.fillRect(bx + barW / 2 - 1, by - 6, 2, barH + 12);

                const cx = bx + s.powerPos * barW;
                const cy = by + barH / 2;
                ctx.beginPath();
                ctx.arc(cx, cy, 10, 0, Math.PI * 2);
                ctx.fillStyle = "#fff";
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#222";
                ctx.stroke();

                ctx.font = "14px Inter, system-ui, sans-serif";
                ctx.fillStyle = "#fff";
                ctx.fillText("Click or Space to jump", bx - 2, by - 12);
            }

            animRef.current = requestAnimationFrame(loop);
        }

        animRef.current = requestAnimationFrame(loop);

        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            lastTimeRef.current = null;
        };
    }, []);

    const handleContainerClick = () => {
        const s = stateRef.current;
        if (s.powerActive) {
            s.preparingJump = true;
            s.prepTime = 0;

            const closeness = 1 - Math.min(1, Math.abs(s.powerPos - 0.5) * 2);
            const effectDuration = 0.3 + closeness * 1.2;

            s.jumpEffects.push({
                x: birdX,
                y: s.birdY + birdRadius,
                timer: 0,
                duration: effectDuration,
                power: closeness,
            });
        } else if (!s.alive) {
            resetGame();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="w-[820px] max-w-full">
                <h1 className="text-2xl font-bold mb-3">Jizz Jump</h1>

                <p className="text-sm mb-4 text-gray-700">
                    Click or press Space to lock the power.
                </p>

                <div
                    ref={containerRef}
                    className="relative rounded-lg shadow-lg overflow-hidden bg-white group"
                >
                    <canvas
                        ref={canvasRef}
                        onClick={handleContainerClick}
                        className="block w-full h-auto cursor-pointer object-contain bg-black"
                        style={{ maxHeight: "100vh", maxWidth: "100vw" }}
                    />

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleFullscreen();
                        }}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded text-xs backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                    >
                        ⛶ Fullscreen
                    </button>
                </div>

                <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                    <div>
                        Click anywhere or press{" "}
                        <span className="font-medium">Space</span> to jump.
                    </div>
                    <div>made with 🍑</div>
                </div>
            </div>
        </div>
    );
}
