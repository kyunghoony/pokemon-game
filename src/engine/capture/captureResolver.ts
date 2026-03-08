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
  const hpBonus = (1 - encounter.hpRatio) * 0.32;
  const rarityPenalty = encounter.rarity === 'mythical' ? -0.2 : encounter.rarity === 'rare' ? -0.08 : 0;
  const shinyPenalty = encounter.shiny ? -0.05 : 0;
  const charmBonus = inventory.charmLevel * 0.015;
  const retryBonus = Math.min(0.2, encounter.retries * 0.04);
  const ballBonus = ball.bonusRate;
  const finalChance = ballType === 'master' ? 1 : Math.min(0.97, Math.max(0.01, baseChance + hpBonus + charmBonus + retryBonus + ballBonus + rarityPenalty + shinyPenalty));
  const roll = randomFloat();
  const success = ballType === 'master' ? true : roll < finalChance;

  return {
    ...encounter,
    phase: success ? 'caught' : 'breakout',
    resultText: success ? `${encounter.pokemon.name} 포획 성공!` : `${encounter.pokemon.name}이(가) 볼에서 탈출했다!`,
    rollContext: { baseChance: baseChance + hpBonus + rarityPenalty + shinyPenalty, charmBonus, retryBonus, ballBonus, finalChance, roll },
    shakes: success ? 3 : Math.min(3, Math.max(1, Math.ceil((roll / Math.max(finalChance, 0.01)) * 2.2))),
    retries: encounter.retries + 1,
  };
};
