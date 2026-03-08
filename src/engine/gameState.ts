import type { GameState } from '../types/game';

export const SAVE_VERSION = 2;
const STORAGE_KEY = 'pokemon-game-save';

export const initialGameState = (): GameState => ({
  version: SAVE_VERSION,
  inventory: {
    rainbowCandy: 3000,
    balls: { poke: 20, great: 8, ultra: 4, master: 1 },
    typeCandy: { 일반: 250 },
    charmLevel: 0,
  },
  collection: [],
  battle: null,
  capture: null,
  logs: ['환영합니다. 배틀/포획 화면으로 게임을 시작하세요!'],
});

export const appendLog = (state: GameState, message: string): GameState => ({
  ...state,
  logs: [message, ...state.logs].slice(0, 60),
});

export const loadState = (): GameState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialGameState();
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (parsed.version !== SAVE_VERSION) {
      return { ...initialGameState(), logs: ['세이브를 새 버전으로 마이그레이션했습니다.'] };
    }
    return { ...initialGameState(), ...parsed } as GameState;
  } catch {
    return initialGameState();
  }
};

export const persistState = (state: GameState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
