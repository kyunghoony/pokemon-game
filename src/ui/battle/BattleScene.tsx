import { memo, useEffect, useMemo, useState } from 'react';
import { MOVE_INDEX } from '../../data/moves/moveData';
import { POKEMON_INDEX } from '../../data/pokemonData';
import { useBattleAnimationQueue } from '../animation/useBattleAnimationQueue';
import type { BattleState, EngineEvent, Inventory } from '../../types/game';

interface Props {
  battle: BattleState | null;
  events: EngineEvent[];
  inventory: Inventory;
  onStart: () => void;
  onAdvance: () => void;
  onMove: (index: number) => void;
  onSwitch: (index: number) => void;
}

type CommandTab = 'command' | 'fight' | 'bag' | 'pokemon';

const hpPercent = (hp: number, max: number) => Math.max(0, Math.min(100, Math.round((hp / Math.max(1, max)) * 100)));
const xpPercent = (hp: number, max: number) => Math.max(5, Math.min(100, Math.round((hp / Math.max(1, max)) * 72 + 18)));
const levelFromStats = (maxHp: number) => Math.max(5, Math.min(100, Math.floor(maxHp / 4)));

export const BattleScene = memo(({ battle, events, inventory, onStart, onAdvance, onMove, onSwitch }: Props) => {
  const [playerHpDisplay, setPlayerHpDisplay] = useState(100);
  const [enemyHpDisplay, setEnemyHpDisplay] = useState(100);
  const [menuTab, setMenuTab] = useState<CommandTab>('command');
  const motion = useBattleAnimationQueue(events);

  const message = useMemo(() => {
    const line = [...events].reverse().find((event) => event.text)?.text;
    return line ?? battle?.pendingMessage ?? '';
  }, [battle?.pendingMessage, events]);

  useEffect(() => {
    if (!battle) return;
    const player = battle.playerTeam[battle.playerActive];
    const enemy = battle.enemyTeam[battle.enemyActive];
    setPlayerHpDisplay(hpPercent(player.hp, player.maxHp));
    setEnemyHpDisplay(hpPercent(enemy.hp, enemy.maxHp));
  }, [battle]);

  useEffect(() => {
    if (!battle) return;
    if (battle.phase === 'choose_move') {
      setMenuTab('fight');
      return;
    }
    if (battle.phase === 'forced_switch') {
      setMenuTab('pokemon');
      return;
    }
    if (battle.phase !== 'choose_action') setMenuTab('command');
  }, [battle]);

  if (!battle) {
    return (
      <section className="battle-screen">
        <div className="battle-stage-modern battle-bg-grass">
          <div className="battle-dialog battle-dialog-text">포켓몬 배틀 준비 중...</div>
          <div className="battle-ui-lower single"><button className="menu-btn menu-btn-major" onClick={onStart}>배틀 시작</button></div>
        </div>
      </section>
    );
  }

  const player = battle.playerTeam[battle.playerActive];
  const enemy = battle.enemyTeam[battle.enemyActive];
  const playerSpecies = POKEMON_INDEX[player.speciesId];
  const enemySpecies = POKEMON_INDEX[enemy.speciesId];
  const canInput = !motion.locked;

  const showCommand = battle.phase === 'choose_action' && menuTab === 'command';
  const showFight = battle.phase === 'choose_move' || (battle.phase === 'choose_action' && menuTab === 'fight');
  const showBag = battle.phase === 'choose_action' && menuTab === 'bag';
  const showPokemon = battle.phase === 'forced_switch' || (battle.phase === 'choose_action' && menuTab === 'pokemon');

  return (
    <section className="battle-screen">
      <div className={`battle-stage-modern battle-bg-battle ${motion.camera}`}>
        <div className="battle-parallax battle-parallax-far" />
        <div className="battle-parallax battle-parallax-near" />
        <div className="battle-platform enemy" />
        <div className="battle-platform player" />

        <div className={`battle-sprite-wrap enemy ${motion.target} ${enemy.fainted ? 'motion-faint' : 'motion-entry-enemy'}`}>
          <div className="battle-shadow enemy" />
          <img src={enemySpecies.sprites.front} alt={enemy.name} className="battle-sprite front motion-idle" />
        </div>

        <div className={`battle-sprite-wrap player ${motion.attacker} ${player.fainted ? 'motion-faint' : 'motion-entry-player'}`}>
          <div className="battle-shadow player" />
          <img src={playerSpecies.sprites.back} alt={player.name} className="battle-sprite back motion-idle" />
        </div>

        <div className="battle-hud-modern enemy pokemon-hud-box">
          <div className="hud-topline"><strong>{enemy.name}</strong><span>Lv.{levelFromStats(enemy.maxHp)}</span></div>
          <div className="hp-track"><div className="hp-fill" style={{ width: `${enemyHpDisplay}%` }} /></div>
        </div>

        <div className="battle-hud-modern player pokemon-hud-box">
          <div className="hud-topline"><strong>{player.name}</strong><span>Lv.{levelFromStats(player.maxHp)}</span></div>
          <div className="hp-track"><div className="hp-fill" style={{ width: `${playerHpDisplay}%` }} /></div>
          <small className="hud-hp-readout">HP {player.hp}/{player.maxHp}</small>
          <div className="xp-track"><div className="xp-fill" style={{ width: `${xpPercent(player.hp, player.maxHp)}%` }} /></div>
        </div>

        <div className={`fx-layer battle-layer-fx ${motion.projectile} ${motion.impact}`} />

        <div className="battle-dialog battle-dialog-text">{message}</div>

        {(battle.phase === 'battle_intro' || battle.phase === 'turn_start' || battle.phase === 'turn_end' || battle.phase === 'status_tick') && (
          <div className="battle-ui-lower single"><button className="menu-btn menu-btn-major" disabled={!canInput} onClick={onAdvance}>다음</button></div>
        )}

        {(showCommand || showFight || showBag || showPokemon) && (
          <div className="battle-ui-lower">
            {showCommand && (
              <div className="battle-menu-grid command-grid">
                <button className="menu-btn menu-btn-command" disabled={!canInput} onClick={() => { setMenuTab('fight'); onAdvance(); }}>FIGHT</button>
                <button className="menu-btn menu-btn-command" disabled={!canInput} onClick={() => setMenuTab('bag')}>BAG</button>
                <button className="menu-btn menu-btn-command" disabled={!canInput} onClick={() => setMenuTab('pokemon')}>POKéMON</button>
                <button className="menu-btn menu-btn-command" disabled>RUN</button>
              </div>
            )}

            {showFight && (
              <div className="battle-menu-grid">
                {player.moves.map((slot, index) => {
                  const move = MOVE_INDEX[slot.moveId];
                  return (
                    <button key={`${slot.moveId}-${index}`} className="menu-btn move" disabled={!canInput || battle.phase !== 'choose_move' || slot.pp <= 0} onClick={() => onMove(index)}>
                      <div>{move?.name ?? slot.moveId}</div>
                      <small>PP {slot.pp}/{slot.maxPp}</small>
                    </button>
                  );
                })}
              </div>
            )}

            {showBag && (
              <div className="battle-menu-grid bag-grid">
                <button className="menu-btn">몬스터볼 x{inventory.balls.poke}</button>
                <button className="menu-btn">수퍼볼 x{inventory.balls.great}</button>
                <button className="menu-btn">하이퍼볼 x{inventory.balls.ultra}</button>
                <button className="menu-btn">마스터볼 x{inventory.balls.master}</button>
                <button className="menu-btn back" onClick={() => setMenuTab('command')}>뒤로</button>
              </div>
            )}

            {showPokemon && (
              <div className="battle-menu-grid pokemon-grid">
                {battle.playerTeam.map((member, idx) => (
                  <button key={member.uid} className="menu-btn" disabled={!canInput || member.fainted || idx === battle.playerActive} onClick={() => onSwitch(idx)}>
                    {member.name} · HP {member.hp}/{member.maxHp}
                  </button>
                ))}
                {battle.phase === 'choose_action' && <button className="menu-btn back" onClick={() => setMenuTab('command')}>뒤로</button>}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
});
