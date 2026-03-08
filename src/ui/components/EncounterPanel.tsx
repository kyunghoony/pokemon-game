import type { BallType, GameState } from '../../types/game';

interface EncounterPanelProps {
  state: GameState;
  onThrowBall: (ballType: BallType) => void;
}

const BALLS: BallType[] = ['poke', 'great', 'ultra', 'master'];

export const EncounterPanel = ({ state, onThrowBall }: EncounterPanelProps) => {
  return (
    <section className="panel">
      <h2>조우</h2>
      {state.currentEncounter ? (
        <div>
          <p>
            #{state.currentEncounter.dex} {state.currentEncounter.name}
          </p>
          <p>타입: {state.currentEncounter.types.join(', ')}</p>
          <div className="row">
            {BALLS.map((ball) => (
              <button key={ball} onClick={() => onThrowBall(ball)} disabled={state.ballBag[ball] <= 0}>
                {ball} ({state.ballBag[ball]})
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p>현재 조우 중인 포켓몬이 없습니다.</p>
      )}
    </section>
  );
};
