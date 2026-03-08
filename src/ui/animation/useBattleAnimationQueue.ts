import { useEffect, useRef, useState } from 'react';
import type { EngineEvent } from '../../types/game';
import { battleEventPreset, type MotionPatch } from './motionPresets';

interface BattleMotionState {
  camera: string;
  attacker: string;
  target: string;
  projectile: string;
  impact: string;
  status: string;
  locked: boolean;
}

const initialState: BattleMotionState = {
  camera: '',
  attacker: '',
  target: '',
  projectile: '',
  impact: '',
  status: '',
  locked: false,
};

export const useBattleAnimationQueue = (events: EngineEvent[]) => {
  const [state, setState] = useState<BattleMotionState>(initialState);
  const seqRef = useRef(0);

  useEffect(() => {
    if (!events.length) return;
    const seq = ++seqRef.current;
    const applyPatch = (patch: MotionPatch) => {
      setState((prev) => ({ ...prev, ...patch }));
    };
    const run = async () => {
      setState((prev) => ({ ...prev, locked: true }));
      for (const event of events) {
        for (const step of battleEventPreset(event)) {
          if (seq !== seqRef.current) return;
          step.mutate(applyPatch);
          await new Promise((r) => setTimeout(r, step.duration));
          applyPatch({ camera: '', attacker: '', target: '', projectile: '', impact: '', status: '' });
        }
      }
      if (seq === seqRef.current) setState((prev) => ({ ...prev, locked: false }));
    };
    run();
  }, [events]);

  return state;
};
