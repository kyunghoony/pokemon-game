import { memo, useMemo, useState } from 'react';
import { BALL_SPECS } from '../../data/items/itemData';
import { useCaptureAnimationQueue } from '../animation/useCaptureAnimationQueue';
import type { CaptureEncounter, EngineEvent, Inventory } from '../../types/game';

interface Props {
  encounter: CaptureEncounter | null;
  events: EngineEvent[];
  inventory: Inventory;
  onAdvance: () => void;
  onThrow: (ball: 'poke' | 'great' | 'ultra' | 'master') => void;
  onRetry: () => void;
  onFinish: () => void;
}

export const CaptureScene = memo(({ encounter, events, inventory, onAdvance, onThrow, onRetry, onFinish }: Props) => {
  const [selectedBall, setSelectedBall] = useState<'poke' | 'great' | 'ultra' | 'master' | null>(null);
  const motion = useCaptureAnimationQueue(events);
  const dialog = useMemo(() => [...events].reverse().find((event) => event.text)?.text ?? encounter?.resultText ?? '', [encounter?.resultText, events]);

  if (!encounter) {
    return (
      <section className="battle-screen">
        <div className="battle-stage-modern battle-bg-cave">
          <div className="battle-dialog">포획할 포켓몬이 없다.</div>
          <div className="battle-ui-lower single"><button className="menu-btn" onClick={onFinish}>월드로 복귀</button></div>
        </div>
      </section>
    );
  }

  return (
    <section className="battle-screen">
      <div className="battle-stage-modern battle-bg-cave">
        <div className="battle-platform enemy" />
        <div className={`battle-sprite-wrap enemy ${motion.pokemon} ${encounter.shiny ? 'special-aura-shiny' : ''}`}>
          <img src={encounter.pokemon.sprites.front} alt={encounter.pokemon.name} className="battle-sprite front motion-idle" />
        </div>

        <div className={`capture-ball capture-layer-ball ${selectedBall ? `ball-${selectedBall}` : ''} ${motion.ball}`} />
        <div className={`capture-layer-fx ${motion.aura}`}><div className="shake-indicator">흔들림 {encounter.shakes}</div></div>

        <div className="battle-hud-modern enemy">
          <strong>{encounter.pokemon.name} Lv.{encounter.level}</strong>
          <div className="hp-track"><div className="hp-fill" style={{ width: `${Math.round(encounter.hpRatio * 100)}%` }} /></div>
        </div>

        <div className="battle-dialog">{dialog}</div>

        {(encounter.phase === 'encounter_intro' || encounter.phase === 'encounter_continue') && (
          <div className="battle-ui-lower single"><button className="menu-btn" disabled={motion.locked} onClick={onAdvance}>계속</button></div>
        )}

        {encounter.phase === 'ball_select' && (
          <div className="battle-ui-lower">
            <div className="battle-menu-grid bag-grid">
              {BALL_SPECS.map((ball) => (
                <button
                  key={ball.key}
                  className={`menu-btn ${selectedBall === ball.key ? 'is-selected' : ''}`}
                  disabled={inventory.balls[ball.key] <= 0 || motion.locked}
                  onClick={() => {
                    setSelectedBall(ball.key);
                    onThrow(ball.key);
                  }}
                >
                  {ball.label} x{inventory.balls[ball.key]}
                </button>
              ))}
            </div>
          </div>
        )}

        {encounter.phase === 'caught' && <div className="battle-ui-lower single"><button className="menu-btn" onClick={onFinish}>포획 완료</button></div>}
        {encounter.phase === 'breakout' && <div className="battle-ui-lower"><div className="battle-menu-grid"><button className="menu-btn" onClick={onRetry}>다시 던진다</button><button className="menu-btn" onClick={onFinish}>포기한다</button></div></div>}
      </div>
    </section>
  );
});
