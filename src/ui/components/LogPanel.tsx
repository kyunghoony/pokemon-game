import type { GameState } from '../../types/game';

interface LogPanelProps {
  state: GameState;
}

export const LogPanel = ({ state }: LogPanelProps) => {
  return (
    <section className="panel">
      <h2>로그</h2>
      <ul>
        {state.logs.map((log, index) => (
          <li key={`${log}-${index}`}>{log}</li>
        ))}
      </ul>
    </section>
  );
};
