import { useEffect, useRef, useState } from 'react';
import type { EngineEvent } from '../../types/game';
import { captureEventPreset, type MotionPatch } from './motionPresets';

interface CaptureMotionState {
  ball: string;
  pokemon: string;
  aura: string;
  status: string;
  locked: boolean;
}

const initialState: CaptureMotionState = {
  ball: '',
  pokemon: '',
  aura: '',
  status: '',
  locked: false,
};

export const useCaptureAnimationQueue = (events: EngineEvent[]) => {
  const [state, setState] = useState<CaptureMotionState>(initialState);
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
        for (const step of captureEventPreset(event)) {
          if (seq !== seqRef.current) return;
          step.mutate(applyPatch);
          await new Promise((r) => setTimeout(r, step.duration));
          applyPatch({ ball: '', pokemon: '', aura: '', status: '' });
        }
      }
      if (seq === seqRef.current) setState((prev) => ({ ...prev, locked: false }));
    };
    run();
  }, [events]);

  return state;
};
