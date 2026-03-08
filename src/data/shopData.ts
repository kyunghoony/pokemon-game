import type { BallSpec, ShopItem } from '../types/game';

export const BALL_SPECS: BallSpec[] = [
  { key: 'poke', label: '몬스터볼', bonusRate: 0 },
  { key: 'great', label: '슈퍼볼', bonusRate: 0.1 },
  { key: 'ultra', label: '하이퍼볼', bonusRate: 0.18 },
  { key: 'master', label: '마스터볼', bonusRate: 1 },
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'poke_bundle', title: '몬스터볼 10개', price: 60, ballType: 'poke', amount: 10 },
  { id: 'great_bundle', title: '슈퍼볼 5개', price: 90, ballType: 'great', amount: 5 },
  { id: 'ultra_bundle', title: '하이퍼볼 3개', price: 120, ballType: 'ultra', amount: 3 },
  { id: 'master_single', title: '마스터볼 1개', price: 300, ballType: 'master', amount: 1 },
];
