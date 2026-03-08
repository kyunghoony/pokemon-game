import { useEffect, useMemo, useRef, useState } from 'react';
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

const categoryFxClass = (category?: MoveCategory) => {
  if (!category) return '';
  if (category === 'beam') return 'fx-beam';
  if (category === 'projectile') return 'fx-projectile';
  if (category === 'slash' || category === 'struggle') return 'fx-slash';
  if (category === 'status' || category === 'healing') return 'fx-heal';
  if (category === 'gigantamax') return 'fx-gmax';
  return '';
};

const hpPercent = (hp: number, max: number) => Math.max(0, Math.min(100, Math.round((hp / Math.max(1, max)) * 100)));

export const BattleScene = ({ battle, events, onStart, onAdvance, onMove, onSwitch }: Props) => {
  const [playerHpDisplay, setPlayerHpDisplay] = useState(100);
  const [enemyHpDisplay, setEnemyHpDisplay] = useState(100);
  const [fxClass, setFxClass] = useState('');
  const [flashSide, setFlashSide] = useState<'player' | 'enemy' | null>(null);
  const [popup, setPopup] = useState('');
  const [locked, setLocked] = useState(false);
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
      for (const event of events) {
        if (seq !== seqRef.current) return;
        if (event.type === 'MOVE_PREPARE') {
          setFlashSide((event.payload?.side as 'player' | 'enemy') ?? null);
          await new Promise((r) => setTimeout(r, 220));
        }
        if (event.type === 'PROJECTILE_FIRED') {
          setFxClass(categoryFxClass(event.payload?.category as MoveCategory));
          await new Promise((r) => setTimeout(r, 280));
        }
        if (event.type === 'HIT_CONFIRMED') {
          setFlashSide('enemy');
          await new Promise((r) => setTimeout(r, 200));
        }
        if (event.type === 'DAMAGE_APPLIED' && event.text) {
          setPopup(event.text);
          await new Promise((r) => setTimeout(r, 320));
          setPopup('');
        }
        if (event.type === 'POKEMON_FAINTED') {
          setFlashSide('enemy');
          await new Promise((r) => setTimeout(r, 320));
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

  if (!battle) {
    return (
      <section className="scene-card battle-scene-v2">
        <h2>턴제 배틀</h2>
        <button className="game-btn primary" onClick={onStart}>배틀 시작</button>
      </section>
    );
  }

  const player = battle.playerTeam[battle.playerActive];
  const enemy = battle.enemyTeam[battle.enemyActive];
  const canAction = !locked && (battle.phase === 'choose_action' || battle.phase === 'choose_move' || battle.phase === 'forced_switch');

  return (
    <section className="scene-card battle-scene-v2">
      <div className="battle-stage">
        <div className="battle-bg" />
        <div className={`fx-layer ${fxClass}`} />

        <div className={`poke-card enemy ${flashSide === 'enemy' ? 'hit' : ''} ${enemy.fainted ? 'faint' : ''}`}>
          <strong>{enemy.name}</strong>
          <div className="hp-track"><div className="hp-fill" style={{ width: `${enemyHpDisplay}%` }} /></div>
          <small>{enemy.hp}/{enemy.maxHp}</small>
        </div>

        <div className={`poke-card player ${flashSide === 'player' ? 'prep' : ''} ${player.fainted ? 'faint' : ''}`}>
          <strong>{player.name}</strong>
          <div className="hp-track"><div className="hp-fill" style={{ width: `${playerHpDisplay}%` }} /></div>
          <small>{player.hp}/{player.maxHp}</small>
        </div>

        {popup && <div className="damage-popup">{popup}</div>}
      </div>

      <div className="status-row">
        <p>{battle.pendingMessage}</p>
        {locked && <span className="lock-badge">연출 재생 중...</span>}
      </div>

      {(battle.phase === 'battle_intro' || battle.phase === 'turn_start' || battle.phase === 'turn_end') && (
        <button className="game-btn" disabled={locked} onClick={onAdvance}>다음</button>
      )}

      {(battle.phase === 'choose_action' || battle.phase === 'forced_switch') && (
        <div className="actions">
          {battle.phase === 'choose_action' && <button className="game-btn" disabled={!canAction} onClick={onAdvance}>기술 선택</button>}
          {battle.playerTeam.map((member, idx) => (
            <button
              key={member.uid}
              className="game-btn"
              disabled={!canAction || member.fainted || idx === battle.playerActive}
              onClick={() => onSwitch(idx)}
            >
              교체 {member.name}{member.fainted ? '(기절)' : ''}
            </button>
          ))}
        </div>
      )}

      {battle.phase === 'choose_move' && (
        <div className="actions grid2 move-panel">
          {player.moves.map((slot, index) => {
            const move = MOVE_INDEX[slot.moveId];
            return (
              <button key={slot.moveId} className="game-btn" disabled={!canAction} onClick={() => onMove(index)}>
                <div>{move?.name ?? slot.moveId}</div>
                <small>{move?.category} · PP {slot.pp}/{slot.maxPp}</small>
              </button>
            );
          })}
        </div>
      )}

      <div className="mini-log">{latestLogs.map((line, i) => <div key={`${line}-${i}`}>{line}</div>)}</div>
      {battle.phase === 'battle_end' && <div className="result">{battle.winner === 'player' ? '승리!' : '패배'}</div>}
    </section>
  );
};
