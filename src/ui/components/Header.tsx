import type { GameState } from '../../types/game';

interface HeaderProps {
  state: GameState;
  capturedCount: number;
  uniqueCount: number;
  onStartEncounter: () => void;
}

export const Header = ({ state, capturedCount, uniqueCount, onStartEncounter }: HeaderProps) => {
  return (
    <header className="panel">
      <h1>포켓몬 몬스터볼 수집 게임</h1>
      <p>단일 HTML 구조에서 React + TypeScript 구조로 이전한 초기 버전입니다.</p>
      <div className="stats">
        <span>코인: {state.coins}</span>
        <span>전체 포획: {capturedCount}</span>
        <span>고유 도감: {uniqueCount}</span>
      </div>
      <button onClick={onStartEncounter}>탐험 시작</button>
    </header>
  );
};
