import type { EngineEvent } from '../../types/game';
import { animationTokens } from './animationTokens';

export interface MotionStep {
  duration: number;
  mutate: (apply: (patch: MotionPatch) => void) => void;
}

export interface MotionPatch {
  camera?: string;
  attacker?: string;
  target?: string;
  projectile?: string;
  impact?: string;
  ball?: string;
  pokemon?: string;
  aura?: string;
  status?: string;
}

const d = animationTokens.duration;

export const battleEventPreset = (event: EngineEvent): MotionStep[] => {
  if (event.type === 'MOVE_PREPARE') {
    const isPlayer = event.payload?.side === 'player';
    return [{ duration: d.short, mutate: (set) => set({ camera: 'cam-focus', attacker: isPlayer ? 'motion-attack-prep-player' : 'motion-attack-prep-enemy' }) }];
  }
  if (event.type === 'MOVE_USED' || event.type === 'PROJECTILE_FIRED') {
    const category = String(event.payload?.category ?? 'projectile');
    return [{ duration: d.medium, mutate: (set) => set({ projectile: `motion-projectile-${category}` }) }];
  }
  if (event.type === 'HIT_CONFIRMED') {
    return [
      { duration: d.instant, mutate: (set) => set({ camera: 'cam-hit-pause' }) },
      { duration: d.short, mutate: (set) => set({ camera: 'cam-shake', target: 'motion-hit-recoil', impact: 'motion-hit-flash' }) },
    ];
  }
  if (event.type === 'POKEMON_FAINTED') {
    const target = event.payload?.side === 'player' ? 'player' : 'enemy';
    return [{ duration: d.long, mutate: (set) => set({ [target === 'player' ? 'attacker' : 'target']: 'motion-faint' }) }];
  }
  if (event.type === 'DAMAGE_APPLIED') {
    return [{ duration: d.medium, mutate: (set) => set({ status: 'motion-damage-pop' }) }];
  }
  return [];
};

export const captureEventPreset = (event: EngineEvent): MotionStep[] => {
  if (event.type === 'BALL_THROWN') {
    const ball = String(event.payload?.ball ?? 'poke');
    return [{ duration: d.medium, mutate: (set) => set({ ball: `motion-ball-throw ${ball}`, status: 'motion-aim-charge' }) }];
  }
  if (event.type === 'BALL_ABSORB') {
    return [{ duration: d.medium, mutate: (set) => set({ pokemon: 'motion-capture-absorb', aura: 'motion-capture-glow' }) }];
  }
  if (event.type === 'BALL_SHAKE') {
    const count = Number(event.payload?.count ?? 1);
    return [{ duration: d.short + count * 40, mutate: (set) => set({ ball: `motion-capture-shake-${count}` }) }];
  }
  if (event.type === 'CAPTURE_SUCCESS') {
    return [{ duration: d.long, mutate: (set) => set({ aura: 'motion-reward-pop', status: 'motion-success-burst' }) }];
  }
  if (event.type === 'CAPTURE_FAIL') {
    return [{ duration: d.medium, mutate: (set) => set({ pokemon: 'motion-breakout', aura: 'motion-breakout-burst' }) }];
  }
  return [];
};
