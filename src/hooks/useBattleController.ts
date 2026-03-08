import { useMemo, useState } from 'react';
import { continueBattleFlow, createBattle, chooseSwitch, resolveTurn } from '../engine/battle/battleMachine';
import type { BattleState, EngineEvent } from '../types/game';

export const useBattleController = (onLog: (message: string) => void) => {
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [events, setEvents] = useState<EngineEvent[]>([]);

  const startBattle = () => {
    const next = createBattle();
    setBattle(next);
    onLog('턴제 배틀 시작!');
  };

  const advancePhase = () => {
    setBattle((prev) => (prev ? continueBattleFlow(prev) : prev));
  };

  const chooseMove = (moveIndex: number) => {
    setBattle((prev) => {
      if (!prev) return prev;
      const resolved = resolveTurn(prev, moveIndex);
      setEvents(resolved.events);
      resolved.events.forEach((event) => event.text && onLog(event.text));
      return resolved.next;
    });
  };

  const doSwitch = (index: number) => {
    setBattle((prev) => (prev ? chooseSwitch(prev, index) : prev));
  };

  const activePlayer = useMemo(() => (battle ? battle.playerTeam[battle.playerActive] : null), [battle]);

  return { battle, events, startBattle, advancePhase, chooseMove, doSwitch, activePlayer };
};
