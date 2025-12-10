"use client";
import { useEffect, useRef, useState } from "react";

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [age, setAge] = useState(0);
  const ageRef = useRef(0);
  const [ageRank, setAgeRank] = useState("");
  const [gameOver, setGameOver] = useState(false);

  const xRef = useRef(150);
  const yRef = useRef(60);
  const vxRef = useRef(2.5);
  const vyRef = useRef(0);
  const fallingRef = useRef(false);
  const bouncedRef = useRef(false);
  const gameOverRef = useRef(false);

  const gravity = 0.12;
  const circleRadius = 15;
  const bigY = 380;
  const [bigRadiusMultiplier, setBigRadiusMultiplier] = useState(1);

  const bumpAge = () => {
    setAge((a) => {
      const next = a + 1;
      ageRef.current = next;
      return next;
    });
    setAgeRank(() => {
      let rank = "none";
      if (ageRef.current <= 5) rank = "diddy 👶";
      else if (ageRef.current <= 12) rank = "diddy 👶👶";
      else if (ageRef.current <= 16) rank = "still diddy 👶👶👶";
      else if (ageRef.current <= 18) rank = "frosh 🧒";
      else if (ageRef.current <= 19) rank = "sophomore 🧒";
      else if (ageRef.current <= 20) rank = "junior 🧒";
      else if (ageRef.current <= 21) rank = "senior 🧒";
      else if (ageRef.current <= 25) rank = "grad student";
      else if (ageRef.current <= 55) rank = "prof 💀";
      else if (ageRef.current <= 65) rank = "senior prof 💀";
      else rank = "ultra tenured prof 💀💀💀";
      return rank;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const width = canvas.width;
    const baseBigRadius = (width - 2 * circleRadius) / 2;
    const bigLeftX = 0;
    const bigRightX = width;
    let rafId: number;

    function reset() {
      xRef.current = 150;
      yRef.current = 60;
      vxRef.current = 2.5;
      vyRef.current = 0;
      fallingRef.current = false;
      bouncedRef.current = false;
      ageRef.current = 0;
      setAge(0);
      setAgeRank("");
      setGameOver(false);
      gameOverRef.current = false;
      setBigRadiusMultiplier(1);
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.font = "22px sans-serif";
      ctx.fillStyle = "black";
      ctx.fillText(`age: ${ageRef.current}  |  rank: ${ageRank ?? "-"}`, 20, 40);
      ctx.fillText(ageRank, 20, 70);

      if (!gameOverRef.current) {
        xRef.current += vxRef.current;
        if (xRef.current < 20 || xRef.current > canvas.width - 20) {
          vxRef.current *= -1;
        }

        if (fallingRef.current) {
          vyRef.current += gravity;
          yRef.current += vyRef.current;
        }

        ctx.beginPath();
        ctx.arc(xRef.current, yRef.current, circleRadius, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();

        const bigRadius = baseBigRadius * bigRadiusMultiplier;

        ctx.beginPath();
        ctx.arc(bigLeftX, bigY, bigRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#ddd";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(bigRightX, bigY, bigRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#ddd";
        ctx.fill();

        const dxLeft = xRef.current - bigLeftX;
        const dyLeft = yRef.current - bigY;
        const dLeft = Math.hypot(dxLeft, dyLeft);

        const dxRight = xRef.current - bigRightX;
        const dyRight = yRef.current - bigY;
        const dRight = Math.hypot(dxRight, dyRight);

        const hitLeft = dLeft < bigRadius + circleRadius;
        const hitRight = dRight < bigRadius + circleRadius;

        if (hitLeft || hitRight) {
          let nx = 0;
          let ny = 0;
          let dist = 1;

          if (hitLeft && dLeft !== 0) {
            nx = dxLeft / dLeft;
            ny = dyLeft / dLeft;
            dist = dLeft;
          } else if (hitRight && dRight !== 0) {
            nx = dxRight / dRight;
            ny = dyRight / dRight;
            dist = dRight;
          }

          const vx = vxRef.current;
          const vy = vyRef.current;
          const dot = vx * nx + vy * ny;

          if (dot < 0) {
            let rvx = vx - 2 * dot * nx;
            let rvy = vy - 2 * dot * ny;

            const restitution = 0.15;
            rvx += restitution;
            rvy += restitution;

            vxRef.current = rvx;
            vyRef.current = rvy;

            const start = performance.now();
            function animateGrow(time: number) {
              const elapsed = time - start;
              if (elapsed < 100) {
                setBigRadiusMultiplier(1.05 - 0.05 * (elapsed / 100));
                requestAnimationFrame(animateGrow);
              } else {
                setBigRadiusMultiplier(1);
              }
            }
            requestAnimationFrame(animateGrow);

            const overlap = bigRadius + circleRadius - dist;
            if (overlap > 0) {
              xRef.current += nx * overlap;
              yRef.current += ny * overlap;
            }

            if (!bouncedRef.current) {
              bumpAge();
              bouncedRef.current = true;
              setTimeout(() => (bouncedRef.current = false), 200);
            }
          }
        }

        if (fallingRef.current && yRef.current + circleRadius >= canvas.height) {
          setGameOver(true);
          gameOverRef.current = true;
        }
      } else {
        ctx.font = "22px sans-serif";
        ctx.fillStyle = "black";
        ctx.fillText(`age: ${ageRef.current}`, 110, 200);
        ctx.fillText(ageRank, 110, 230);

        ctx.font = "20px sans-serif";
        ctx.fillText("click to play again", 120, 260);
      }

      rafId = requestAnimationFrame(tick);
    }

    const handleClick = () => {
      if (gameOverRef.current) reset();
      else fallingRef.current = true;
    };

    canvas.addEventListener("click", handleClick);
    tick();

    return () => {
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(rafId);
    };
  }, [ageRank]);

  return (
    <div className="flex justify-center mt-10">
      <canvas
        ref={canvasRef}
        width={400}
        height={500}
        style={{ border: "1px solid #aaa", borderRadius: 8 }}
      />
    </div>
  );
}
