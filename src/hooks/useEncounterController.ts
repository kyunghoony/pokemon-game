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

  const emitEvents = (nextEvents: EngineEvent[]) => {
    setEvents(nextEvents);
    nextEvents.forEach((event) => event.text && onLog(event.text));
  };

  const startEncounter = () => {
    const next = createEncounter();
    setEncounter(next);
    setEvents([]);
    onLog(next.resultText);
  };

  const advance = () => {
    setEncounter((prev) => {
      if (!prev) return prev;
      const advanced = advanceEncounter(prev);
      if (advanced.events.length) emitEvents(advanced.events);
      return advanced.next;
    });
  };

  const throwBall = (ball: BallType) => {
    setEncounter((prev) => {
      if (!prev) return prev;
      if (inventory.balls[ball] <= 0) {
        emitEvents([{ type: 'EFFECT_MESSAGE', text: `${ball} 볼이 부족합니다.` }]);
        return prev;
      }

      const result = runThrowBall(prev, ball, inventory);
      if (result.next === prev) {
        emitEvents(result.events);
        return prev;
      }

      onConsumeBall(ball);
      emitEvents(result.events);
      onLog(`${ball} 볼 투척`);
      onLog(result.next.resultText);
      if (result.next.phase === 'caught') {
        onCaught(result.next.pokemon.id);
      }
      return result.next;
    });
  };

  const resetEncounter = () => {
    setEncounter(null);
    setEvents([]);
  };

  return { encounter, events, startEncounter, advance, throwBall, resetEncounter };
};
