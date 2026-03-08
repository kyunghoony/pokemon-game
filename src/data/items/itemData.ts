import type { BallSpec, ShopItem } from '../../types/game';

export const BALL_SPECS: BallSpec[] = [
  { key: 'poke', label: '몬스터볼', bonusRate: 0.02, trailClass: 'trail-basic' },
  { key: 'great', label: '슈퍼볼', bonusRate: 0.12, trailClass: 'trail-great' },
  { key: 'ultra', label: '하이퍼볼', bonusRate: 0.22, trailClass: 'trail-ultra' },
  { key: 'master', label: '마스터볼', bonusRate: 1, trailClass: 'trail-master' },
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'poke-ball', title: '몬스터볼 x5', price: 120, ballType: 'poke', amount: 5, currency: 'rainbowCandy' },
  { id: 'great-ball', title: '슈퍼볼 x3', price: 240, ballType: 'great', amount: 3, currency: 'rainbowCandy' },
  { id: 'ultra-ball', title: '하이퍼볼 x2', price: 360, ballType: 'ultra', amount: 2, currency: 'rainbowCandy' },
  { id: 'master-ball', title: '마스터볼 x1', price: 1500, ballType: 'master', amount: 1, currency: 'rainbowCandy' },
  { id: 'charm-fragment', title: '포획부적 파편', price: 200, amount: 1, currency: 'typeCandy' },
];
