import { memo, useEffect, useMemo, useRef, useState } from 'react';
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

const chanceLabel = (chance: number) => (chance >= 0.66 ? '쉬움' : chance >= 0.42 ? '보통' : '어려움');

export const EncounterScene = memo(({ encounter, events, inventory, onStart, onAdvance, onThrow, onNext }: Props) => {
  const [ballFx, setBallFx] = useState('');
  const [ballAnim, setBallAnim] = useState('');
  const [shakeCount, setShakeCount] = useState(0);
  const [status, setStatus] = useState('');
  const [locked, setLocked] = useState(false);
  const [introFx, setIntroFx] = useState('');
  const seqRef = useRef(0);

  const eventLogs = useMemo(() => events.filter((e) => e.text).slice(-3).map((e) => e.text as string), [events]);

  useEffect(() => {
    if (!encounter) return;
    setIntroFx(encounter.rarity === 'mythical' ? 'flash-mythical' : encounter.rarity === 'rare' ? 'flash-rare' : 'flash-normal');
    const id = setTimeout(() => setIntroFx(''), 500);
    return () => clearTimeout(id);
  }, [encounter?.pokemon.id]);

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

  if (!encounter) return <section className="scene-card capture-scene-v2"><h2>포획 조우</h2><button className="game-btn primary" onClick={onStart}>포켓몬 탐색</button></section>;

  const canThrow = encounter.phase === 'ball_select' && !locked;
  const rollChance = encounter.rollContext?.finalChance ?? (encounter.pokemon.catchRate + (1 - encounter.hpRatio) * 0.25);

  return (
    <section className="scene-card capture-scene-v2">
      <div className={`encounter-stage ${introFx}`}>
        <div className="encounter-bg capture-layer-bg" />
        <div className={`wild-mon capture-layer-pokemon slide-in ${encounter.phase === 'breakout' ? 'breakout' : ''}`}>{encounter.shiny ? '✨ ' : ''}{encounter.pokemon.name}</div>
        <div className={`capture-ball capture-layer-ball ${ballFx} ${ballAnim}`} />
        <div className="capture-layer-fx"><div className="shake-indicator">흔들림: {shakeCount}</div></div>
        <div className="capture-layer-ui rarity-indicator">{encounter.rarity.toUpperCase()} · Lv.{encounter.level}</div>
      </div>

      <div className="status-row">
        <p>{status || encounter.resultText}</p>
        {locked && <span className="lock-badge">연출 재생 중...</span>}
      </div>

      <div className="capture-ux">포획 감각: <strong>{chanceLabel(rollChance)}</strong> · HP 보정 {encounter.hpRatio < 0.4 ? '크게 유리' : encounter.hpRatio < 0.7 ? '약간 유리' : '불리'}</div>
      <div className="capture-ux">볼 인벤토리: 몬스터 {inventory.balls.poke} / 수퍼 {inventory.balls.great} / 하이퍼 {inventory.balls.ultra} / 마스터 {inventory.balls.master}</div>

      {(encounter.phase === 'encounter_intro' || encounter.phase === 'encounter_continue') && <button className="game-btn" disabled={locked} onClick={onAdvance}>진행</button>}

      {encounter.phase === 'ball_select' && <div className="actions grid2">{BALL_SPECS.map((ball) => <button key={ball.key} className={`game-btn ${ball.trailClass}`} disabled={inventory.balls[ball.key] <= 0 || !canThrow} onClick={() => onThrow(ball.key)}><div>{ball.label}</div><small>{inventory.balls[ball.key] <= 0 ? '재고 없음' : '투척 가능'} · 보유 {inventory.balls[ball.key]}개</small></button>)}</div>}

      {encounter.phase === 'caught' && <div className="actions"><button className="game-btn primary" onClick={onNext}>다음 포켓몬 만나기</button></div>}

      {encounter.phase === 'breakout' && <div className="actions"><button className="game-btn" disabled={locked} onClick={onAdvance}>다시 던지기 선택</button><button className="game-btn" disabled={locked} onClick={onNext}>다음 포켓몬 만나기(무료)</button></div>}

      <div className="mini-log">{eventLogs.map((line, i) => <div key={`${line}-${i}`}>{line}</div>)}</div>
    </section>
  );
});
