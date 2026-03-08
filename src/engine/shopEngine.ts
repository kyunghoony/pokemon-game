import { SHOP_ITEMS } from '../data/items/itemData';
import type { GameState } from '../types/game';

export const buyItem = (state: GameState, itemId: string): GameState => {
  const item = SHOP_ITEMS.find((entry) => entry.id === itemId);
  if (!item) return state;

  const useTypeCandy = item.currency === 'typeCandy';
  if (useTypeCandy) {
    if ((state.inventory.typeCandy.일반 ?? 0) < item.price) return state;
    return {
      ...state,
      inventory: {
        ...state.inventory,
        charmLevel: state.inventory.charmLevel + 1,
        typeCandy: {
          ...state.inventory.typeCandy,
          일반: (state.inventory.typeCandy.일반 ?? 0) - item.price,
        },
      },
    };
  }

  if (state.inventory.rainbowCandy < item.price) return state;
  return {
    ...state,
    inventory: {
      ...state.inventory,
      rainbowCandy: state.inventory.rainbowCandy - item.price,
      balls: item.ballType
        ? {
            ...state.inventory.balls,
            [item.ballType]: state.inventory.balls[item.ballType] + item.amount,
          }
        : state.inventory.balls,
    },
  };
};
