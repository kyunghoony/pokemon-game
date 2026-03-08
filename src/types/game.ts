export type Region = '관동' | '성도' | '호연' | '신오';

export type BallType = 'poke' | 'great' | 'ultra' | 'master';

export interface Pokemon {
  id: string;
  dex: number;
  name: string;
  region: Region;
  types: string[];
  catchRate: number;
  spawnWeight: number;
}

export interface BallSpec {
  key: BallType;
  label: string;
  bonusRate: number;
}

export interface ShopItem {
  id: string;
  title: string;
  price: number;
  ballType: BallType;
  amount: number;
}

export interface GameState {
  coins: number;
  ballBag: Record<BallType, number>;
  collection: Pokemon[];
  currentEncounter: Pokemon | null;
  logs: string[];
}
