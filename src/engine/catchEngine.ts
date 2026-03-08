import { BALL_SPECS } from '../data/shopData';
import type { BallType, Pokemon } from '../types/game';
import { randomFloat } from './random';

export const tryCatch = (pokemon: Pokemon, ballType: BallType): boolean => {
  const ball = BALL_SPECS.find((spec) => spec.key === ballType);
  if (!ball) {
    return false;
  }

  if (ballType === 'master') {
    return true;
  }

  const chance = Math.min(0.95, pokemon.catchRate + ball.bonusRate);
  return randomFloat() < chance;
};
