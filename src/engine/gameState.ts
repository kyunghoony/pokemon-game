import type { BallType, GameState, Inventory } from '../types/game';

export const SAVE_VERSION = 3;
const STORAGE_KEY = 'pokemon-game-save';

const DEFAULT_BALLS: Record<BallType, number> = { poke: 20, great: 8, ultra: 4, master: 1 };

const createInitialInventory = (): Inventory => ({
  rainbowCandy: 3000,
  balls: { ...DEFAULT_BALLS },
  typeCandy: { 일반: 250 },
  charmLevel: 0,
});

export const initialGameState = (): GameState => ({
  version: SAVE_VERSION,
  inventory: createInitialInventory(),
  collection: [],
  battle: null,
  capture: null,
  logs: ['환영합니다. 배틀/포획 화면으로 게임을 시작하세요!'],
});

export const appendLog = (state: GameState, message: string): GameState => ({
  ...state,
  logs: [message, ...state.logs].slice(0, 60),
});

const normalizeInventory = (inventory?: Partial<Inventory>): Inventory => ({
  rainbowCandy: Math.max(0, Math.floor(inventory?.rainbowCandy ?? 3000)),
  balls: {
    poke: Math.max(0, Math.floor(inventory?.balls?.poke ?? DEFAULT_BALLS.poke)),
    great: Math.max(0, Math.floor(inventory?.balls?.great ?? DEFAULT_BALLS.great)),
    ultra: Math.max(0, Math.floor(inventory?.balls?.ultra ?? DEFAULT_BALLS.ultra)),
    master: Math.max(0, Math.floor(inventory?.balls?.master ?? DEFAULT_BALLS.master)),
  },
  typeCandy: { 일반: Math.max(0, Math.floor(inventory?.typeCandy?.일반 ?? 250)) },
  charmLevel: Math.max(0, Math.floor(inventory?.charmLevel ?? 0)),
});

const migrateState = (parsed: Partial<GameState>): GameState => {
  const base = initialGameState();
  const migrated: GameState = {
    ...base,
    ...parsed,
    version: SAVE_VERSION,
    inventory: normalizeInventory(parsed.inventory),
    collection: Array.isArray(parsed.collection) ? parsed.collection.filter((id): id is string => typeof id === 'string') : [],
    logs: Array.isArray(parsed.logs) ? parsed.logs.filter((line): line is string => typeof line === 'string').slice(0, 60) : base.logs,
    battle: null,
    capture: null,
  };

  if (!migrated.logs.length) {
    migrated.logs = ['저장 데이터가 비어 있어 기본 로그를 복구했습니다.'];
  }

  if ((parsed.version ?? 0) !== SAVE_VERSION) {
    migrated.logs = ['세이브를 최신 버전으로 마이그레이션했습니다.', ...migrated.logs].slice(0, 60);
  }

  return migrated;
};

export const loadState = (): GameState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialGameState();
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return migrateState(parsed);
  } catch {
    return initialGameState();
  }
};

export const persistState = (state: GameState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, version: SAVE_VERSION }));
};
