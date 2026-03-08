import { SHOP_ITEMS } from '../data/shopData';
import type { GameState } from '../types/game';

export const buyItem = (state: GameState, itemId: string): GameState => {
  const item = SHOP_ITEMS.find((candidate) => candidate.id === itemId);
  if (!item || state.coins < item.price) {
    return state;
  }

  return {
    ...state,
    coins: state.coins - item.price,
    ballBag: {
      ...state.ballBag,
      [item.ballType]: state.ballBag[item.ballType] + item.amount,
    },
  };
};
