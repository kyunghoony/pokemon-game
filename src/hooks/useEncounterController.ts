import { useState } from 'react';
import { createEncounter, advanceEncounter, throwBall as runThrowBall } from '../engine/capture/captureMachine';
import type { BallType, CaptureEncounter, EngineEvent, Inventory } from '../types/game';

export const useEncounterController = (
  inventory: Inventory,
  onConsumeBall: (ball: BallType) => void,
  onCaught: (pokemonId: string) => void,
  onLog: (message: string) => void,
) => {
  const [encounter, setEncounter] = useState<CaptureEncounter | null>(null);
  const [events, setEvents] = useState<EngineEvent[]>([]);

  const startEncounter = () => {
    const next = createEncounter();
    setEncounter(next);
    onLog(next.resultText);
  };

  const advance = () => setEncounter((prev) => (prev ? advanceEncounter(prev) : prev));

  const throwBall = (ball: BallType) => {
    setEncounter((prev) => {
      if (!prev || inventory.balls[ball] <= 0) return prev;
      onConsumeBall(ball);
      const result = runThrowBall(prev, ball, inventory);
      setEvents(result.events);
      onLog(`${ball} 볼 투척`);
      if (result.next.phase === 'caught') {
        onCaught(result.next.pokemon.id);
        onLog(result.next.resultText);
      } else {
        onLog(result.next.resultText);
      }
      return result.next;
    });
  };

  const resetEncounter = () => setEncounter(null);

  return { encounter, events, startEncounter, advance, throwBall, resetEncounter };
};
