// components/Game.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  GRAVITY,
  JUMP_VELOCITY,
  INITIAL_BIRD_Y,
  BIRD_SIZE,
  PIPE_WIDTH,
  PIPE_SPEED
} from '@/lib/gameLogic';

import Pipe from './Pipe'; // Assume this component exists

interface PipeState {
  x: number;
  gapY: number; // Y-position of the center of the gap
  id: number;
}

export default function Game() {
  const [birdY, setBirdY] = useState(INITIAL_BIRD_Y);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<PipeState[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const requestRef = useRef<number>();
  const lastPipeId = useRef(0);
  const gameStarted = useRef(false);

  // --- Core Game Loop ---
  const gameLoop = useCallback(() => {
    if (isGameOver) return;

    setBirdY(prevY => {
      // 1. Apply Gravity
      let newVelocity = velocity + GRAVITY;
      let newY = prevY + newVelocity;

      // 2. Check for Ceiling/Floor Collision
      if (newY < 0) newY = 0;
      if (newY + BIRD_SIZE > GAME_HEIGHT) {
        setIsGameOver(true);
        return prevY; // Stop movement
      }

      setVelocity(newVelocity);

      // 3. Check for Pipe Collision (Simplified for concept)
      // This is the most complex part of the game logic.
      // You would iterate through `pipes` and check for intersection
      // of the bird's bounding box with the pipe's bounding box.
      
      // Example: check if bird is within x-range of the first pipe
      const firstPipe = pipes[0];
      if (firstPipe) {
        if (newY < firstPipe.gapY - 50 || newY + BIRD_SIZE > firstPipe.gapY + 50) {
            if (firstPipe.x < BIRD_SIZE && firstPipe.x + PIPE_WIDTH > 0) {
                // setIsGameOver(true);
            }
        }
      }

      return newY;
    });

    // 4. Update Pipe Positions and Score
    setPipes(prevPipes => {
      const newPipes = prevPipes.map(p => ({
        ...p,
        x: p.x - PIPE_SPEED, // Move left
      })).filter(p => p.x > -PIPE_WIDTH); // Remove off-screen pipes

      // Check for score (bird passed a pipe)
      prevPipes.forEach(p => {
        if (p.x >= 0 && p.x - PIPE_SPEED < 0) { // Pipe just passed x=0
            setScore(s => s + 1);
        }
      });
      
      // Pipe Spawning Logic (Every ~150 frames or distance)
      if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 200) {
        lastPipeId.current += 1;
        newPipes.push({
          x: GAME_WIDTH,
          // Random gap Y position
          gapY: Math.random() * (GAME_HEIGHT - 200) + 100, 
          id: lastPipeId.current,
        });
      }

      return newPipes;
    });

    // Request the next frame
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [isGameOver, velocity, pipes]);

  // --- Flap/Jump Functionality ---
  const handleFlap = useCallback(() => {
    if (isGameOver) {
        // Reset game on first click after game over
        setBirdY(INITIAL_BIRD_Y);
        setVelocity(0);
        setPipes([]);
        setScore(0);
        setIsGameOver(false);
        gameStarted.current = true;
        return;
    }
    if (!gameStarted.current) {
        gameStarted.current = true;
    }
    setVelocity(JUMP_VELOCITY);
  }, [isGameOver]);

  useEffect(() => {
    window.addEventListener('click', handleFlap);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            handleFlap();
        }
    });

    return () => {
      window.removeEventListener('click', handleFlap);
      window.removeEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            handleFlap();
        }
      });
    };
  }, [handleFlap]);

  // Start/Stop Game Loop Effect
  useEffect(() => {
    if (gameStarted.current && !isGameOver) {
      requestRef.current = requestAnimationFrame(gameLoop);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameLoop, isGameOver]);

  // --- Rendering ---
  return (
    <div
      style={{
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        backgroundColor: '#70c5ce',
        position: 'relative',
        overflow: 'hidden',
        margin: '50px auto',
        border: '2px solid black',
        cursor: isGameOver ? 'pointer' : 'default',
      }}
    >
      {/* Bird */}
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: birdY,
          width: BIRD_SIZE,
          height: BIRD_SIZE,
          backgroundColor: 'yellow',
          borderRadius: '50%',
          transition: 'transform 0.1s', // For visual smoothness
          transform: `rotate(${velocity * 1.5}deg)`, // Simple rotation based on velocity
          zIndex: 10,
        }}
      />

      {/* Pipes */}
      {pipes.map(pipe => (
        <Pipe
          key={pipe.id}
          x={pipe.x}
          gapY={pipe.gapY}
        />
      ))}

      {/* Score and Game Over */}
      <div style={{ position: 'absolute', top: 10, left: 10, fontSize: '2em', color: 'white', textShadow: '2px 2px black', zIndex: 20 }}>
        Score: {score}
      </div>

      {isGameOver && (
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: '20px', zIndex: 30 }}>
          GAME OVER! Click to restart.
        </div>
      )}
    </div>
  );
}