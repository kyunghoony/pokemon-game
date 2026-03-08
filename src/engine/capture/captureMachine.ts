import { POKEMON_DATA } from '../../data/pokemonData';
import type { BallType, CaptureEncounter, EngineEvent } from '../../types/game';
import { randomFloat, randomInt, weightedPick } from '../shared/rng';
import { runCaptureRoll } from './captureResolver';

export const createEncounter = (): CaptureEncounter => {
  const pokemon = weightedPick(POKEMON_DATA, (item) => item.spawnWeight);
  const shiny = randomFloat() < 0.03;
  const mythical = randomFloat() < 0.06;
  const rare = !mythical && (pokemon.rarity === 'legendary' || randomFloat() < 0.18);
  const rarity = mythical ? 'mythical' : rare ? 'rare' : 'normal';
  const level = randomInt(28) + (rarity === 'mythical' ? 58 : rarity === 'rare' ? 38 : 12);
  const hpRatio = Math.max(0.08, Math.min(1, (randomInt(70) + 20) / 100));
  return {
    pokemon,
    level,
    rarity,
    shiny,
    hpRatio,
    phase: 'encounter_intro',
    selectedBall: 'poke',
    shakes: 0,
    resultText: `${shiny ? '✨ ' : ''}${pokemon.name} Lv.${level} 등장!`,
    retries: 0,
  };
};

export const advanceEncounter = (encounter: CaptureEncounter): { next: CaptureEncounter; events: EngineEvent[] } => {
  if (encounter.phase === 'encounter_intro') return { next: { ...encounter, phase: 'ball_select', resultText: '볼을 선택해 던지세요.' }, events: [] };
  if (encounter.phase === 'breakout') return { next: { ...encounter, phase: 'encounter_continue', resultText: '탈출했다! 다시 시도할까요?' }, events: [] };
  if (encounter.phase === 'encounter_continue') return { next: { ...encounter, phase: 'ball_select', resultText: '다시 볼을 선택하세요.' }, events: [] };
  return { next: encounter, events: [{ type: 'EFFECT_MESSAGE', text: `진행 불가 상태입니다. phase=${encounter.phase}` }] };
};

export const throwBall = (
  encounter: CaptureEncounter,
  ballType: BallType,
  inventory: { charmLevel: number },
): { next: CaptureEncounter; events: EngineEvent[] } => {
  if (encounter.phase !== 'ball_select') {
    return { next: encounter, events: [{ type: 'EFFECT_MESSAGE', text: `볼 투척 불가 상태입니다. phase=${encounter.phase}` }] };
  }

  const throwingState: CaptureEncounter = { ...encounter, selectedBall: ballType, phase: 'throwing', resultText: `${ballType} 볼 투척!` };
  const rolled = runCaptureRoll(throwingState, { ...inventory, balls: { poke: 0, great: 0, ultra: 0, master: 0 }, rainbowCandy: 0, typeCandy: {} }, ballType);

  const shakeEvents: EngineEvent[] = Array.from({ length: rolled.shakes }, (_, index) => ({
    type: 'BALL_SHAKE',
    text: `${index + 1}회 흔들림`,
    payload: { count: index + 1, ball: ballType, timing: 180 + randomInt(240) },
  }));

  return {
    next: {
      ...rolled,
      phase: rolled.phase === 'caught' ? 'caught' : 'breakout',
    },
    events: [
      { type: 'TURN_LOCKED' },
      { type: 'BALL_THROWN', payload: { ball: ballType } },
      { type: 'BALL_ABSORB', payload: { ball: ballType } },
      { type: 'EFFECT_MESSAGE', text: '숨죽이는 순간...' },
      ...shakeEvents,
      { type: rolled.phase === 'caught' ? 'CAPTURE_SUCCESS' : 'CAPTURE_FAIL' },
      ...(rolled.phase === 'caught' ? [] : [{ type: 'EFFECT_MESSAGE' as const, text: '볼이 터지며 강하게 탈출했다!' }]),
    ],
  };
};
