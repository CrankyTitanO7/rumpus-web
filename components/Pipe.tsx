// components/Pipe.tsx
import React from 'react';
import { GAME_HEIGHT, PIPE_WIDTH } from '@/lib/gameLogic';

interface PipeProps {
  x: number;
  gapY: number; // Center of the gap
  gapSize?: number; // Default 100
}

const GAP_SIZE = 100;

export default function Pipe({ x, gapY }: PipeProps) {
  // Height of the top pipe (from 0 to gapY - GAP_SIZE/2)
  const topHeight = gapY - GAP_SIZE / 2;
  // Height of the bottom pipe (from gapY + GAP_SIZE/2 to GAME_HEIGHT)
  const bottomHeight = GAME_HEIGHT - (gapY + GAP_SIZE / 2);

  const pipeStyle: React.CSSProperties = {
    position: 'absolute',
    width: PIPE_WIDTH,
    backgroundColor: 'green',
    border: '3px solid #555',
    zIndex: 5,
  };

  return (
    <>
      {/* Top Pipe */}
      <div
        style={{
          ...pipeStyle,
          left: x,
          top: 0,
          height: topHeight,
        }}
      />

      {/* Bottom Pipe */}
      <div
        style={{
          ...pipeStyle,
          left: x,
          bottom: 0,
          height: bottomHeight,
        }}
      />
    </>
  );
}