import { BALL_SPECS } from '../../data/items/itemData';
import type { BallType, CaptureEncounter, Inventory } from '../../types/game';
import { randomFloat } from '../shared/rng';

export const runCaptureRoll = (
  encounter: CaptureEncounter,
  inventory: Inventory,
  ballType: BallType,
): CaptureEncounter => {
  const ball = BALL_SPECS.find((spec) => spec.key === ballType);
  if (!ball) return encounter;

  const baseChance = encounter.pokemon.catchRate;
  const charmBonus = inventory.charmLevel * 0.015;
  const retryBonus = Math.min(0.2, encounter.retries * 0.04);
  const ballBonus = ball.bonusRate;
  const finalChance = ballType === 'master' ? 1 : Math.min(0.97, baseChance + charmBonus + retryBonus + ballBonus);
  const roll = randomFloat();
  const success = roll <= finalChance;

  return {
    ...encounter,
    phase: success ? 'caught' : 'breakout',
    resultText: success ? `${encounter.pokemon.name} 포획 성공!` : `${encounter.pokemon.name}이(가) 볼에서 탈출했다!`,
    rollContext: { baseChance, charmBonus, retryBonus, ballBonus, finalChance, roll },
    shakes: success ? 3 : Math.max(1, Math.floor((roll / Math.max(finalChance, 0.01)) * 3)),
    retries: encounter.retries + 1,
  };
};
