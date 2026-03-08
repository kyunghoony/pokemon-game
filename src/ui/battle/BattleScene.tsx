import { MOVE_INDEX } from '../../data/moves/moveData';
import type { BattleState, EngineEvent } from '../../types/game';

interface Props {
  battle: BattleState | null;
  events: EngineEvent[];
  onStart: () => void;
  onAdvance: () => void;
  onMove: (index: number) => void;
  onSwitch: (index: number) => void;
}

export const BattleScene = ({ battle, events, onStart, onAdvance, onMove, onSwitch }: Props) => {
  if (!battle) {
    return (
      <section className="scene-card battle-scene">
        <h2>턴제 배틀</h2>
        <button className="game-btn primary" onClick={onStart}>배틀 시작</button>
      </section>
    );
  }

  const player = battle.playerTeam[battle.playerActive];
  const enemy = battle.enemyTeam[battle.enemyActive];
  const latestEvent = events[events.length - 1];

  return (
    <section className="scene-card battle-scene">
      <div className="battlefield">
        <div className="bg-layer" />
        <div className={`pokemon enemy ${latestEvent?.type === 'HIT_CONFIRMED' ? 'hit' : ''}`}>{enemy.name} {enemy.hp}/{enemy.maxHp}</div>
        <div className={`pokemon player ${latestEvent?.type === 'PROJECTILE_FIRED' ? 'attack' : ''}`}>{player.name} {player.hp}/{player.maxHp}</div>
        {latestEvent?.type === 'DAMAGE_APPLIED' && <div className="damage-popup">{latestEvent.text}</div>}
      </div>
      <div className="command-layer">
        <p>{battle.pendingMessage}</p>
        {(battle.phase === 'battle_intro' || battle.phase === 'turn_start' || battle.phase === 'turn_end') && (
          <button className="game-btn" onClick={onAdvance}>다음</button>
        )}
        {(battle.phase === 'choose_action' || battle.phase === 'forced_switch') && (
          <div className="actions">
            {battle.phase === 'choose_action' && <button className="game-btn" onClick={onAdvance}>기술 선택</button>}
            <button className="game-btn" onClick={() => onSwitch((battle.playerActive + 1) % battle.playerTeam.length)}>교체</button>
          </div>
        )}
        {battle.phase === 'choose_move' && (
          <div className="actions grid2">
            {player.moves.map((slot, index) => (
              <button key={slot.moveId} className="game-btn" onClick={() => onMove(index)}>
                {MOVE_INDEX[slot.moveId]?.name ?? slot.moveId} ({slot.pp}/{slot.maxPp})
              </button>
            ))}
          </div>
        )}
        {battle.phase === 'battle_end' && <div className="result">{battle.winner === 'player' ? '승리!' : '패배'}</div>}
      </div>
    </section>
  );
};
