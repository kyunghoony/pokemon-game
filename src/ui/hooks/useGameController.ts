import { useMemo, useState } from 'react';
import { SHOP_ITEMS } from '../../data/shopData';
import { tryCatch } from '../../engine/catchEngine';
import { createEncounter } from '../../engine/encounterEngine';
import { appendLog, consumeBall, initialGameState } from '../../engine/gameState';
import { buyItem } from '../../engine/shopEngine';
import type { BallType, GameState } from '../../types/game';

export const useGameController = () => {
  const [state, setState] = useState<GameState>(() => initialGameState());

  const startEncounter = () => {
    setState((prev) => {
      const encounter = createEncounter();
      return appendLog({ ...prev, currentEncounter: encounter }, `${encounter.name} 이(가) 나타났다!`);
    });
  };

  const throwBall = (ballType: BallType) => {
    setState((prev) => {
      if (!prev.currentEncounter || prev.ballBag[ballType] <= 0) {
        return appendLog(prev, '공이 부족하거나 현재 조우 중인 포켓몬이 없습니다.');
      }

      const afterConsume = consumeBall(prev, ballType);
      const success = tryCatch(prev.currentEncounter, ballType);

      if (success) {
        return appendLog(
          {
            ...afterConsume,
            collection: [...afterConsume.collection, prev.currentEncounter],
            coins: afterConsume.coins + 20,
            currentEncounter: null,
          },
          `${prev.currentEncounter.name} 포획 성공! (+20 코인)`,
        );
      }

      return appendLog(afterConsume, `${prev.currentEncounter.name} 포획 실패!`);
    });
  };

  const purchase = (itemId: string) => {
    setState((prev) => {
      const next = buyItem(prev, itemId);
      if (next === prev) {
        return appendLog(prev, '코인이 부족해서 구매할 수 없습니다.');
      }
      const item = SHOP_ITEMS.find((shop) => shop.id === itemId);
      return appendLog(next, `${item?.title ?? '아이템'} 구매 완료!`);
    });
  };

  const stats = useMemo(
    () => ({
      capturedCount: state.collection.length,
      uniqueCount: new Set(state.collection.map((pokemon) => pokemon.id)).size,
    }),
    [state.collection],
  );

  return { state, stats, startEncounter, throwBall, purchase };
};
