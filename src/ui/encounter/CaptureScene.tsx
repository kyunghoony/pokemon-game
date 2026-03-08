import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { BALL_SPECS } from '../../data/items/itemData';
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

const chanceLabel = (chance: number) => (chance >= 0.66 ? '쉬움' : chance >= 0.42 ? '보통' : '어려움');

export const CaptureScene = memo(({ encounter, events, inventory, onAdvance, onThrow, onRetry, onFinish }: Props) => {
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
          await new Promise((r) => setTimeout(r, 360));
        }
        if (event.type === 'BALL_SHAKE') {
          setShakeCount((event.payload?.count as number) ?? 0);
          setBallAnim('shake');
          await new Promise((r) => setTimeout(r, (event.payload?.timing as number) ?? 280));
        }
        if (event.type === 'CAPTURE_SUCCESS') {
          setBallAnim('success');
          setStatus('포획 성공!');
          await new Promise((r) => setTimeout(r, 640));
        }
        if (event.type === 'CAPTURE_FAIL') {
          setBallAnim('fail burst');
          setStatus('강하게 탈출!');
          await new Promise((r) => setTimeout(r, 520));
        }
      }
      if (seq === seqRef.current) setLocked(false);
    };
    run();
  }, [events]);

  if (!encounter) return <section className="scene-card capture-scene-v2"><h2>CaptureScene</h2><button className="game-btn" onClick={onFinish}>월드로 복귀</button></section>;

  const canThrow = encounter.phase === 'ball_select' && !locked;
  const rollChance = encounter.rollContext?.finalChance ?? (encounter.pokemon.catchRate + (1 - encounter.hpRatio) * 0.25);

  return (
    <section className="scene-card capture-scene-v2 scene-focus">
      <h2>CaptureScene</h2>
      <div className="encounter-stage">
        <div className="encounter-bg capture-layer-bg" />
        <div className={`wild-mon capture-layer-pokemon ${encounter.phase === 'breakout' ? 'breakout' : ''}`}>{encounter.shiny ? '✨ ' : ''}{encounter.pokemon.name}</div>
        <div className={`capture-ball capture-layer-ball ${ballFx} ${ballAnim}`} />
        <div className="capture-layer-fx"><div className="shake-indicator">흔들림: {shakeCount}</div></div>
        <div className="capture-layer-ui rarity-indicator">{encounter.rarity.toUpperCase()} · Lv.{encounter.level}</div>
      </div>

      <div className="status-row">
        <p>{status || encounter.resultText}</p>
        {locked && <span className="lock-badge">연출 재생 중...</span>}
      </div>

      <div className="capture-ux">포획 감각: <strong>{chanceLabel(rollChance)}</strong></div>
      <div className="capture-ux">볼: 몬스터 {inventory.balls.poke} / 수퍼 {inventory.balls.great} / 하이퍼 {inventory.balls.ultra} / 마스터 {inventory.balls.master}</div>

      {(encounter.phase === 'encounter_intro' || encounter.phase === 'encounter_continue') && <button className="game-btn" disabled={locked} onClick={onAdvance}>진행</button>}

      {encounter.phase === 'ball_select' && <div className="actions grid2">{BALL_SPECS.map((ball) => <button key={ball.key} className={`game-btn ${ball.trailClass}`} disabled={inventory.balls[ball.key] <= 0 || !canThrow} onClick={() => onThrow(ball.key)}><div>{ball.label}</div><small>보유 {inventory.balls[ball.key]}개</small></button>)}</div>}

      {encounter.phase === 'caught' && <div className="actions"><button className="game-btn primary" onClick={onFinish}>결과 확인 후 월드로</button></div>}

      {encounter.phase === 'breakout' && <div className="actions"><button className="game-btn" disabled={locked} onClick={onRetry}>다시 던지기</button><button className="game-btn" onClick={onFinish}>포획 종료 후 월드로</button></div>}

      <div className="mini-log">{eventLogs.map((line, i) => <div key={`${line}-${i}`}>{line}</div>)}</div>
    </section>
  );
});
