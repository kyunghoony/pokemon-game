import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [ballFx, setBallFx] = useState('');
  const [ballAnim, setBallAnim] = useState('');
  const [shakeCount, setShakeCount] = useState(0);
  const [status, setStatus] = useState('');
  const [locked, setLocked] = useState(false);
  const seqRef = useRef(0);

  const eventLogs = useMemo(() => events.filter((e) => e.text).slice(-3).map((e) => e.text as string), [events]);

  useEffect(() => {
    if (!events.length) return;
    const seq = ++seqRef.current;
    const run = async () => {
      setLocked(true);
      setShakeCount(0);
      for (const event of events) {
        if (seq !== seqRef.current) return;
        if (event.type === 'BALL_THROWN') {
          const ball = String(event.payload?.ball ?? 'poke');
          setBallFx(`ball-${ball}`);
          setBallAnim('throw');
          setStatus('볼을 던졌다!');
          await new Promise((r) => setTimeout(r, 420));
        }
        if (event.type === 'BALL_ABSORB') {
          setBallAnim('absorb');
          setStatus('포켓몬을 흡수 중...');
          await new Promise((r) => setTimeout(r, 340));
        }
        if (event.type === 'BALL_SHAKE') {
          setShakeCount((event.payload?.count as number) ?? 0);
          setBallAnim('shake');
          await new Promise((r) => setTimeout(r, 290));
        }
        if (event.type === 'CAPTURE_SUCCESS') {
          setBallAnim('success');
          setStatus('포획 성공!');
          await new Promise((r) => setTimeout(r, 520));
        }
        if (event.type === 'CAPTURE_FAIL') {
          setBallAnim('fail');
          setStatus('탈출!');
          await new Promise((r) => setTimeout(r, 360));
        }
      }
      if (seq === seqRef.current) setLocked(false);
    };
    run();
  }, [events]);

  if (!encounter) {
    return (
      <section className="scene-card capture-scene-v2">
        <h2>포획 조우</h2>
        <button className="game-btn primary" onClick={onStart}>포켓몬 탐색</button>
      </section>
    );
  }

  const canThrow = encounter.phase === 'ball_select' && !locked;

  return (
    <section className="scene-card capture-scene-v2">
      <div className="encounter-stage">
        <div className="encounter-bg" />
        <div className={`wild-mon ${encounter.phase === 'breakout' ? 'breakout' : ''}`}>{encounter.pokemon.name}</div>
        <div className={`capture-ball ${ballFx} ${ballAnim}`} />
        <div className="shake-indicator">흔들림: {shakeCount}</div>
      </div>

      <div className="status-row">
        <p>{status || encounter.resultText}</p>
        {locked && <span className="lock-badge">연출 재생 중...</span>}
      </div>

      {(encounter.phase === 'encounter_intro' || encounter.phase === 'encounter_continue') && (
        <button className="game-btn" disabled={locked} onClick={onAdvance}>진행</button>
      )}

      {encounter.phase === 'ball_select' && (
        <div className="actions grid2">
          {BALL_SPECS.map((ball) => (
            <button key={ball.key} className={`game-btn ${ball.trailClass}`} disabled={inventory.balls[ball.key] <= 0 || !canThrow} onClick={() => onThrow(ball.key)}>
              <div>{ball.label}</div>
              <small>보정 +{Math.round(ball.bonusRate * 100)}% · 보유 {inventory.balls[ball.key]}개</small>
            </button>
          ))}
        </div>
      )}

      {encounter.phase === 'caught' && (
        <div className="actions">
          <button className="game-btn primary" onClick={onNext}>다음 포켓몬 만나기</button>
        </div>
      )}

      {encounter.phase === 'breakout' && (
        <div className="actions">
          <button className="game-btn" disabled={locked} onClick={onAdvance}>다시 던지기 선택</button>
          <button className="game-btn" disabled={locked} onClick={onAdvance}>볼 바꾸기 선택</button>
          <button className="game-btn" disabled={locked} onClick={onNext}>다음 포켓몬 만나기(무료)</button>
        </div>
      )}

      {encounter.rollContext && (
        <div className="capture-chance">
          포획률 {Math.round(encounter.rollContext.finalChance * 100)}% (기본 {Math.round(encounter.rollContext.baseChance * 100)}% + 볼 {Math.round(encounter.rollContext.ballBonus * 100)}% + 재시도 {Math.round(encounter.rollContext.retryBonus * 100)}%)
        </div>
      )}

      <div className="mini-log">{eventLogs.map((line, i) => <div key={`${line}-${i}`}>{line}</div>)}</div>
    </section>
  );
};
