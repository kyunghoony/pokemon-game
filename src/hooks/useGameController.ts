import { useEffect, useMemo, useState } from 'react';
import { SHOP_ITEMS } from '../data/items/itemData';
import { appendLog, loadState, persistState } from '../engine/gameState';
import { buyItem } from '../engine/shopEngine';
import type { BallType, GameState } from '../types/game';
import { useBattleController } from './useBattleController';
import { useEncounterController } from './useEncounterController';

export const useGameController = () => {
  const [state, setState] = useState<GameState>(() => loadState());

  const log = (message: string) => setState((prev) => appendLog(prev, message));

  const battle = useBattleController(log, () => {
    setState((prev) =>
      appendLog(
        {
          ...prev,
          inventory: {
            ...prev.inventory,
            rainbowCandy: prev.inventory.rainbowCandy + 180,
            typeCandy: { ...prev.inventory.typeCandy, 일반: (prev.inventory.typeCandy.일반 ?? 0) + 40 },
          },
        },
        '배틀 승리 보상: 무지개사탕 +180, 일반사탕 +40',
      ),
    );
  });

  const encounter = useEncounterController(
    state.inventory,
    (ball: BallType) =>
      setState((prev) => ({
        ...prev,
        inventory: { ...prev.inventory, balls: { ...prev.inventory.balls, [ball]: Math.max(0, prev.inventory.balls[ball] - 1) } },
      })),
    (pokemonId: string) =>
      setState((prev) => ({
        ...prev,
        collection: [...prev.collection, pokemonId],
        inventory: {
          ...prev.inventory,
          rainbowCandy: prev.inventory.rainbowCandy + 80,
          typeCandy: { ...prev.inventory.typeCandy, 일반: (prev.inventory.typeCandy.일반 ?? 0) + 20 },
        },
      })),
    log,
  );

  useEffect(() => {
    persistState(state);
  }, [state]);

  const purchase = (itemId: string) => {
    setState((prev) => {
      const next = buyItem(prev, itemId);
      const item = SHOP_ITEMS.find((shop) => shop.id === itemId);
      if (next === prev) {
        return appendLog(prev, '재화가 부족합니다.');
      }
      return appendLog(next, `${item?.title ?? '아이템'} 구매 완료`);
    });
  };

  const stats = useMemo(
    () => ({ capturedCount: state.collection.length, uniqueCount: new Set(state.collection).size }),
    [state.collection],
  );

  return { state, setState, purchase, stats, battle, encounter };
};
