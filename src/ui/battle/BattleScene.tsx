import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { MOVE_INDEX } from '../../data/moves/moveData';
import type { BattleState, EngineEvent, MoveCategory } from '../../types/game';

interface Props {
  battle: BattleState | null;
  events: EngineEvent[];
  onStart: () => void;
  onAdvance: () => void;
  onMove: (index: number) => void;
  onSwitch: (index: number) => void;
}

const categoryFxClass = (category?: MoveCategory, moveType?: string) => {
  if (!category) return '';
  const typeClass = moveType === '불꽃' ? 'fx-type-fire' : moveType === '물' ? 'fx-type-water' : moveType === '전기' ? 'fx-type-elec' : moveType === '풀' ? 'fx-type-grass' : moveType === '에스퍼' ? 'fx-type-psy' : '';
  if (category === 'beam') return `fx-beam ${typeClass}`;
  if (category === 'projectile') return `fx-projectile ${typeClass}`;
  if (category === 'slash' || category === 'struggle') return `fx-slash ${typeClass}`;
  if (category === 'status' || category === 'healing') return `fx-heal ${typeClass}`;
  if (category === 'gigantamax') return `fx-gmax ${typeClass}`;
  return typeClass;
};

const hpPercent = (hp: number, max: number) => Math.max(0, Math.min(100, Math.round((hp / Math.max(1, max)) * 100)));
const statusLabel = (status: string) => (status === 'none' ? '' : status === 'burn' ? '화상' : status === 'paralysis' ? '마비' : '수면');

const phaseLabel = (phase: BattleState['phase']) => {
  if (phase === 'choose_action' || phase === 'choose_move') return '행동 선택 중';
  if (phase === 'action_resolution') return '애니메이션 진행 중';
  if (phase === 'status_tick') return '상태 이상 처리';
  if (phase === 'forced_switch') return '강제 교체 필요';
  if (phase === 'battle_end') return '승패 확정';
  return '턴 진행';
};

export const BattleScene = memo(({ battle, events, onStart, onAdvance, onMove, onSwitch }: Props) => {
  const [playerHpDisplay, setPlayerHpDisplay] = useState(100);
  const [enemyHpDisplay, setEnemyHpDisplay] = useState(100);
  const [fxClass, setFxClass] = useState('');
  const [flashSide, setFlashSide] = useState<'player' | 'enemy' | null>(null);
  const [popups, setPopups] = useState<Array<{ id: number; text: string }>>([]);
  const [locked, setLocked] = useState(false);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [hoverMove, setHoverMove] = useState<number | null>(null);
  const [cameraFx, setCameraFx] = useState('');
  const seqRef = useRef(0);

  const latestLogs = useMemo(() => events.filter((e) => e.text).slice(-3).map((e) => e.text as string), [events]);

  useEffect(() => {
    if (!battle) return;
    const player = battle.playerTeam[battle.playerActive];
    const enemy = battle.enemyTeam[battle.enemyActive];
    setPlayerHpDisplay(hpPercent(player.hp, player.maxHp));
    setEnemyHpDisplay(hpPercent(enemy.hp, enemy.maxHp));
  }, [battle]);

  useEffect(() => {
    if (!events.length || !battle) return;
    const seq = ++seqRef.current;
    const run = async () => {
      setLocked(true);
      setSelectedMove(null);
      for (const event of events) {
        if (seq !== seqRef.current) return;
        if (event.type === 'MOVE_PREPARE') {
          setFlashSide((event.payload?.side as 'player' | 'enemy') ?? null);
          setCameraFx('zoom');
          await new Promise((r) => setTimeout(r, 160));
          setCameraFx('');
        }
        if (event.type === 'MOVE_USED') {
          setFxClass(categoryFxClass(event.payload?.category as MoveCategory, event.payload?.moveType as string));
          await new Promise((r) => setTimeout(r, 120));
        }
        if (event.type === 'HIT_CONFIRMED') {
          setFlashSide('enemy');
          setCameraFx('shake');
          await new Promise((r) => setTimeout(r, 220));
          setCameraFx('');
        }
        if (event.type === 'DAMAGE_APPLIED' && event.text) {
          const id = Date.now() + Math.floor(Math.random() * 1000);
          setPopups((prev) => [...prev.slice(-1), { id, text: event.text ?? '' }]);
          await new Promise((r) => setTimeout(r, 330));
          setPopups((prev) => prev.filter((item) => item.id !== id));
        }
      }
      if (seq === seqRef.current) {
        setFlashSide(null);
        setFxClass('');
        setLocked(false);
      }
    };
    run();
  }, [events, battle]);

  if (!battle) return <section className="scene-card battle-scene-v2"><h2>턴제 배틀</h2><button className="game-btn primary" onClick={onStart}>배틀 시작</button></section>;

  const player = battle.playerTeam[battle.playerActive];
  const enemy = battle.enemyTeam[battle.enemyActive];
  const canAction = !locked && (battle.phase === 'choose_action' || battle.phase === 'choose_move' || battle.phase === 'forced_switch');

  return (
    <section className="scene-card battle-scene-v2">
      <div className={`battle-stage ${cameraFx}`}>
        <div className="battle-bg battle-layer-bg" />
        <div className={`fx-layer battle-layer-fx ${fxClass}`} />

        <div className={`poke-card enemy battle-layer-pokemon ${flashSide === 'enemy' ? 'hit stagger' : ''} ${enemy.fainted ? 'faint' : ''}`}>
          <strong>{enemy.name} {statusLabel(enemy.status) && <span className="status-chip">{statusLabel(enemy.status)}</span>}</strong>
          <div className="hp-track"><div className={`hp-fill ${flashSide === 'enemy' ? 'damage' : ''}`} style={{ width: `${enemyHpDisplay}%` }} /></div>
          <small>{enemy.hp}/{enemy.maxHp}</small>
        </div>

        <div className={`poke-card player battle-layer-pokemon ${flashSide === 'player' ? 'prep' : ''} ${player.fainted ? 'faint' : ''}`}>
          <strong>{player.name} {statusLabel(player.status) && <span className="status-chip">{statusLabel(player.status)}</span>}</strong>
          <div className="hp-track"><div className={`hp-fill ${flashSide === 'player' ? 'damage' : ''}`} style={{ width: `${playerHpDisplay}%` }} /></div>
          <small>{player.hp}/{player.maxHp}</small>
        </div>

        <div className="battle-layer-ui">
          {popups.map((popup, idx) => <div key={popup.id} className="damage-popup" style={{ top: `${24 + idx * 14}%` }}>{popup.text}</div>)}
        </div>
      </div>

      <div className="status-row">
        <p>턴 {battle.turn} · {battle.pendingMessage}</p>
        <span className="phase-pill">{phaseLabel(battle.phase)} / {battle.actionHint}</span>
        {locked && <span className="lock-badge">연출 재생 중...</span>}
      </div>

      {(battle.phase === 'battle_intro' || battle.phase === 'turn_start' || battle.phase === 'turn_end' || battle.phase === 'status_tick') && <button className="game-btn" disabled={locked} onClick={onAdvance}>다음</button>}

      {(battle.phase === 'choose_action' || battle.phase === 'forced_switch') && <div className="actions">{battle.phase === 'choose_action' && <button className="game-btn" disabled={!canAction} onClick={onAdvance}>기술 선택</button>}{battle.playerTeam.map((member, idx) => <button key={member.uid} className="game-btn" disabled={!canAction || member.fainted || idx === battle.playerActive} onClick={() => onSwitch(idx)}>교체 {member.name}{member.fainted ? '(기절)' : ''}</button>)}</div>}

      {battle.phase === 'choose_move' && (
        <div className="actions grid2 move-panel">
          {player.moves.map((slot, index) => {
            const move = MOVE_INDEX[slot.moveId];
            const ppEmpty = slot.pp <= 0;
            const disabled = !canAction;
            const stateClass = disabled ? 'is-disabled' : ppEmpty ? 'is-pp-empty' : selectedMove === index ? 'is-selected' : 'is-ready';
            return (
              <button key={`${slot.moveId}-${index}`} className={`game-btn ${stateClass}`} disabled={disabled} onMouseEnter={() => setHoverMove(index)} onMouseLeave={() => setHoverMove(null)} onClick={() => { setSelectedMove(index); onMove(index); }}>
                <div>{move?.name ?? slot.moveId}</div>
                <small>PP {slot.pp}/{slot.maxPp} · Power {move?.power ?? '-'} · 명중 {Math.round((move?.accuracy ?? 1) * 100)}%</small>
              </button>
            );
          })}
          {hoverMove !== null && MOVE_INDEX[player.moves[hoverMove].moveId] && (
            <div className="move-hover-card">{MOVE_INDEX[player.moves[hoverMove].moveId].name} / {MOVE_INDEX[player.moves[hoverMove].moveId].type} / {MOVE_INDEX[player.moves[hoverMove].moveId].category}</div>
          )}
        </div>
      )}

      <div className="mini-log">{latestLogs.map((line, i) => <div key={`${line}-${i}`}>{line}</div>)}</div>
      {battle.phase === 'battle_end' && <div className="result">{battle.winner === 'player' ? '승리!' : '패배'}</div>}
    </section>
  );
});
