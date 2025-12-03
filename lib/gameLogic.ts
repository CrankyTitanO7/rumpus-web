// lib/gameLogic.ts

export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 600;
export const BIRD_SIZE = 30;
export const PIPE_WIDTH = 50;

// Physics Constants (Simplified)
export const GRAVITY = 1.2;
export const JUMP_VELOCITY = -15; // Negative Y is up
export const PIPE_SPEED = 5;

// Initial State
export const INITIAL_BIRD_Y = GAME_HEIGHT / 2 - BIRD_SIZE / 2;