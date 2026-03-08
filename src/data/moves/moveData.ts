import type { MoveData } from '../../types/game';

export const STRUGGLE_MOVE: MoveData = {
  id: 'struggle',
  name: '발버둥',
  type: '노말',
  power: 45,
  accuracy: 1,
  pp: 999,
  category: 'struggle',
};

export const MOVE_DATA: MoveData[] = [
  { id: 'flamethrower', name: '화염방사', type: '불꽃', power: 90, accuracy: 0.95, pp: 15, category: 'projectile' },
  { id: 'fire-blast', name: '대문자', type: '불꽃', power: 110, accuracy: 0.85, pp: 5, category: 'beam' },
  { id: 'hydro-pump', name: '하이드로펌프', type: '물', power: 110, accuracy: 0.8, pp: 5, category: 'beam' },
  { id: 'water-pulse', name: '물의파동', type: '물', power: 75, accuracy: 0.95, pp: 15, category: 'projectile' },
  { id: 'thunderbolt', name: '10만볼트', type: '전기', power: 90, accuracy: 0.95, pp: 15, category: 'projectile' },
  { id: 'thunder', name: '번개', type: '전기', power: 110, accuracy: 0.7, pp: 5, category: 'beam' },
  { id: 'leaf-blade', name: '리프블레이드', type: '풀', power: 90, accuracy: 0.95, pp: 15, category: 'slash' },
  { id: 'quick-attack', name: '전광석화', type: '노말', power: 45, accuracy: 1, pp: 30, priority: 1, category: 'slash' },
  { id: 'solar-beam', name: '솔라빔', type: '풀', power: 120, accuracy: 0.85, pp: 5, category: 'beam' },
  { id: 'recover', name: '회복', type: '노말', power: 0, accuracy: 1, pp: 10, category: 'healing', healRatio: 0.35 },
  { id: 'swords-dance', name: '칼춤', type: '노말', power: 0, accuracy: 1, pp: 20, category: 'status' },
  {
    id: 'g-max-psybreak',
    name: '거다이싸이브레이크',
    type: '에스퍼',
    power: 140,
    accuracy: 0.95,
    pp: 3,
    category: 'gigantamax',
    isGigantamax: true,
  },
];

export const MOVE_INDEX = Object.fromEntries(MOVE_DATA.map((move) => [move.id, move]));
