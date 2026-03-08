import { BALL_SPECS } from '../../data/items/itemData';
import type { CaptureEncounter, EngineEvent, Inventory } from '../../types/game';

interface Props {
  encounter: CaptureEncounter | null;
  events: EngineEvent[];
  inventory: Inventory;
  onStart: () => void;
  onAdvance: () => void;
  onThrow: (ball: 'poke' | 'great' | 'ultra' | 'master') => void;
  onNext: () => void;
}

export const EncounterScene = ({ encounter, events, inventory, onStart, onAdvance, onThrow, onNext }: Props) => {
  if (!encounter) {
    return (
      <section className="scene-card capture-scene">
        <h2>포획 조우</h2>
        <button className="game-btn primary" onClick={onStart}>포켓몬 탐색</button>
      </section>
    );
  }

  const event = events[events.length - 1];

  return (
    <section className="scene-card capture-scene">
      <div className="encounter-field">
        <div className="bg-layer night" />
        <div className={`wild ${encounter.phase === 'breakout' ? 'breakout' : ''}`}>{encounter.pokemon.name}</div>
        {event?.type === 'BALL_THROWN' && <div className="ball-arc" />}
        {event?.type === 'BALL_SHAKE' && <div className="shake-text">흔들림 {event.payload?.count}</div>}
      </div>
      <p>{encounter.resultText}</p>
      {(encounter.phase === 'encounter_intro' || encounter.phase === 'encounter_continue') && <button className="game-btn" onClick={onAdvance}>진행</button>}
      {encounter.phase === 'ball_select' && (
        <div className="actions grid2">
          {BALL_SPECS.map((ball) => (
            <button key={ball.key} className="game-btn" disabled={inventory.balls[ball.key] <= 0} onClick={() => onThrow(ball.key)}>
              {ball.label} ({inventory.balls[ball.key]})
            </button>
          ))}
        </div>
      )}
      {encounter.phase === 'caught' && <button className="game-btn primary" onClick={onNext}>다음 포켓몬 만나기</button>}
      {encounter.phase === 'breakout' && (
        <div className="actions">
          <button className="game-btn" onClick={onAdvance}>다시 던지기</button>
          <button className="game-btn" onClick={onNext}>다음 포켓몬 만나기(무료)</button>
        </div>
      )}
    </section>
  );
};
