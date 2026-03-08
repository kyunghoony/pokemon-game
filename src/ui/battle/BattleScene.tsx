import { memo, useEffect, useMemo, useState } from 'react';
import { MOVE_INDEX } from '../../data/moves/moveData';
import { useBattleAnimationQueue } from '../animation/useBattleAnimationQueue';
import type { BattleState, EngineEvent } from '../../types/game';

interface Props {
  battle: BattleState | null;
  events: EngineEvent[];
  onStart: () => void;
  onAdvance: () => void;
  onMove: (index: number) => void;
  onSwitch: (index: number) => void;
}

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
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const [hoverMove, setHoverMove] = useState<number | null>(null);
  const [popups, setPopups] = useState<Array<{ id: number; text: string }>>([]);
  const motion = useBattleAnimationQueue(events);

  const latestLogs = useMemo(() => events.filter((e) => e.text).slice(-3).map((e) => e.text as string), [events]);

  useEffect(() => {
    if (!battle) return;
    const player = battle.playerTeam[battle.playerActive];
    const enemy = battle.enemyTeam[battle.enemyActive];
    setPlayerHpDisplay(hpPercent(player.hp, player.maxHp));
    setEnemyHpDisplay(hpPercent(enemy.hp, enemy.maxHp));
  }, [battle]);

  useEffect(() => {
    const damageEvents = events.filter((event) => event.type === 'DAMAGE_APPLIED' && event.text);
    if (!damageEvents.length) return;
    damageEvents.forEach((event, idx) => {
      const id = Date.now() + idx;
      setPopups((prev) => [...prev.slice(-2), { id, text: event.text ?? '' }]);
      setTimeout(() => setPopups((prev) => prev.filter((item) => item.id !== id)), 650);
    });
  }, [events]);

  if (!battle) return <section className="scene-card battle-scene-v2"><h2>턴제 배틀</h2><button className="game-btn primary" onClick={onStart}>배틀 시작</button></section>;

  const player = battle.playerTeam[battle.playerActive];
  const enemy = battle.enemyTeam[battle.enemyActive];
  const canAction = !motion.locked && (battle.phase === 'choose_action' || battle.phase === 'choose_move' || battle.phase === 'forced_switch');

  return (
    <section className="scene-card battle-scene-v2">
      <div className={`battle-stage battle-stage-cinematic ${motion.camera} ${battle.phase === 'turn_start' ? 'cam-turn-focus' : ''}`}>
        <div className="battle-bg battle-layer-bg" />
        <div className={`fx-layer battle-layer-fx ${motion.projectile} ${motion.impact}`} />

        <div className={`poke-card enemy battle-layer-pokemon motion-idle ${motion.target} ${enemy.fainted ? 'motion-faint' : 'motion-entry-enemy'} ${enemy.isGigantamax ? 'special-aura-gmax' : ''}`}>
          <strong>{enemy.name} {statusLabel(enemy.status) && <span className="status-chip pulse-chip">{statusLabel(enemy.status)}</span>}</strong>
          <div className="hp-track"><div className="hp-fill" style={{ width: `${enemyHpDisplay}%` }} /></div>
          <small>{enemy.hp}/{enemy.maxHp}</small>
        </div>

        <div className={`poke-card player battle-layer-pokemon motion-idle ${motion.attacker} ${player.fainted ? 'motion-faint' : 'motion-entry-player'} ${player.isGigantamax ? 'special-aura-gmax' : ''}`}>
          <strong>{player.name} {statusLabel(player.status) && <span className="status-chip pulse-chip">{statusLabel(player.status)}</span>}</strong>
          <div className="hp-track"><div className="hp-fill" style={{ width: `${playerHpDisplay}%` }} /></div>
          <small>{player.hp}/{player.maxHp}</small>
        </div>

        <div className="battle-layer-ui">
          {popups.map((popup, idx) => <div key={popup.id} className="damage-popup motion-damage-pop" style={{ top: `${24 + idx * 16}%` }}>{popup.text}</div>)}
        </div>
      </div>

      <div className="status-row">
        <p>턴 {battle.turn} · {battle.pendingMessage}</p>
        <span className="phase-pill">{phaseLabel(battle.phase)} / {battle.actionHint}</span>
        {motion.locked && <span className="lock-badge">연출 재생 중...</span>}
      </div>

      {(battle.phase === 'battle_intro' || battle.phase === 'turn_start' || battle.phase === 'turn_end' || battle.phase === 'status_tick') && <button className="game-btn" disabled={motion.locked} onClick={onAdvance}>다음</button>}

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
      {battle.phase === 'battle_end' && <div className="result motion-reward-pop">{battle.winner === 'player' ? '승리!' : '패배'}</div>}
    </section>
  );
});
