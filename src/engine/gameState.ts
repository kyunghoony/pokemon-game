import type { BallType, GameState } from '../types/game';

export const initialGameState = (): GameState => ({
  coins: 200,
  ballBag: { poke: 20, great: 3, ultra: 1, master: 0 },
  collection: [],
  currentEncounter: null,
  logs: ['게임을 시작했습니다. 탐험 버튼을 눌러 포켓몬을 만나보세요!'],
});

export const appendLog = (state: GameState, message: string): GameState => ({
  ...state,
  logs: [message, ...state.logs].slice(0, 50),
});

export const consumeBall = (state: GameState, ball: BallType): GameState => ({
  ...state,
  ballBag: {
    ...state.ballBag,
    [ball]: Math.max(0, state.ballBag[ball] - 1),
  },
});
