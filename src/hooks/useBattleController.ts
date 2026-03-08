import { useMemo, useState } from 'react';
import { continueBattleFlow, createBattle, chooseSwitch, resolveTurn } from '../engine/battle/battleMachine';
import type { BattleState, EngineEvent } from '../types/game';

export const useBattleController = (onLog: (message: string) => void, onWin: () => void) => {
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [events, setEvents] = useState<EngineEvent[]>([]);

  const startBattle = () => {
    const next = createBattle();
    setBattle(next);
    setEvents([]);
    onLog('턴제 배틀 시작!');
  };

  const emitEvents = (nextEvents: EngineEvent[]) => {
    setEvents(nextEvents);
    nextEvents.forEach((event) => event.text && onLog(event.text));
  };

  const advancePhase = () => {
    setBattle((prev) => {
      if (!prev) return prev;
      const progressed = continueBattleFlow(prev);
      if (progressed.events.length) emitEvents(progressed.events);
      return progressed.next;
    });
  };

  const chooseMove = (moveIndex: number) => {
    setBattle((prev) => {
      if (!prev) return prev;
      const resolved = resolveTurn(prev, moveIndex);
      emitEvents(resolved.events);
      if (resolved.next.phase === 'battle_end' && resolved.next.winner === 'player') {
        onWin();
      }
      return resolved.next;
    });
  };

  const doSwitch = (index: number) => {
    setBattle((prev) => {
      if (!prev) return prev;
      const switched = chooseSwitch(prev, index);
      if (switched.events.length) emitEvents(switched.events);
      return switched.next;
    });
  };

  const activePlayer = useMemo(() => (battle ? battle.playerTeam[battle.playerActive] : null), [battle]);

  return { battle, events, startBattle, advancePhase, chooseMove, doSwitch, activePlayer };
};
