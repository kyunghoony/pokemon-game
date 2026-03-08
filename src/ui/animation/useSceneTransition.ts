import { useMemo } from 'react';

export type Scene = 'title' | 'world' | 'encounter' | 'battle' | 'capture' | 'shop' | 'collection';

export const useSceneTransition = (from: Scene, to: Scene) => {
  return useMemo(() => {
    if (from === 'world' && to === 'encounter') return 'transition-warp-in';
    if (from === 'encounter' && to === 'capture') return 'transition-lock-zoom';
    if (from === 'encounter' && to === 'battle') return 'transition-battle-stage';
    if (from === 'battle' && to === 'world') return 'transition-battle-out';
    if (from === 'world' && (to === 'shop' || to === 'collection')) return 'transition-panel-open';
    if (to === 'world') return 'transition-return';
    return 'transition-fade';
  }, [from, to]);
};
