import { POKEMON_DATA } from '../../data/pokemonData';
import type { BallType, CaptureEncounter, EngineEvent } from '../../types/game';
import { weightedPick } from '../shared/rng';
import { runCaptureRoll } from './captureResolver';

export const createEncounter = (): CaptureEncounter => {
  const pokemon = weightedPick(POKEMON_DATA, (item) => item.spawnWeight);
  return {
    pokemon,
    phase: 'encounter_intro',
    selectedBall: 'poke',
    shakes: 0,
    resultText: `${pokemon.name} 등장!`,
    retries: 0,
  };
};

export const advanceEncounter = (encounter: CaptureEncounter): CaptureEncounter => {
  if (encounter.phase === 'encounter_intro') return { ...encounter, phase: 'ball_select', resultText: '볼을 선택해 던지세요.' };
  if (encounter.phase === 'breakout') return { ...encounter, phase: 'encounter_continue', resultText: '탈출했다! 다시 시도할까요?' };
  if (encounter.phase === 'encounter_continue') return { ...encounter, phase: 'ball_select', resultText: '다시 볼을 선택하세요.' };
  return encounter;
};

export const throwBall = (
  encounter: CaptureEncounter,
  ballType: BallType,
  inventory: { charmLevel: number },
): { next: CaptureEncounter; events: EngineEvent[] } => {
  const throwingState: CaptureEncounter = { ...encounter, selectedBall: ballType, phase: 'throwing', resultText: `${ballType} 볼 투척!` };
  const rolled = runCaptureRoll(throwingState, { ...inventory, balls: { poke: 0, great: 0, ultra: 0, master: 0 }, rainbowCandy: 0, typeCandy: {} }, ballType);

  const shakeEvents: EngineEvent[] = Array.from({ length: rolled.shakes }, (_, index) => ({
    type: 'BALL_SHAKE',
    text: `${index + 1}회 흔들림`,
    payload: { count: index + 1, ball: ballType },
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
      ...shakeEvents,
      { type: rolled.phase === 'caught' ? 'CAPTURE_SUCCESS' : 'CAPTURE_FAIL' },
    ],
  };
};
