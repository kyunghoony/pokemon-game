import { POKEMON_DATA } from '../../data/pokemonData';
import type { BattlePokemon, BattleState, EngineEvent, PokemonSpecies } from '../../types/game';
import { randomInt } from '../shared/rng';
import { selectAiMoveIndex } from './ai';
import { resolveMove } from './battleResolver';

const toBattlePokemon = (species: PokemonSpecies, suffix: string, isGigantamax = false): BattlePokemon => ({
  uid: `${species.id}-${suffix}-${Math.random().toString(36).slice(2, 7)}`,
  speciesId: species.id,
  name: species.name,
  types: species.types,
  maxHp: species.baseHp,
  hp: species.baseHp,
  attack: species.attack,
  defense: species.defense,
  speed: species.speed,
  isGigantamax,
  fainted: false,
  moves: [...species.movePool, ...(isGigantamax && species.gigantamaxMoveId ? [species.gigantamaxMoveId] : [])]
    .slice(0, 4)
    .map((moveId) => ({ moveId, pp: moveId.includes('g-max') ? 3 : moveId.includes('blast') || moveId.includes('beam') ? 5 : 15, maxPp: moveId.includes('g-max') ? 3 : moveId.includes('blast') || moveId.includes('beam') ? 5 : 15 })),
});

export const createBattle = (): BattleState => {
  const playerSpecies = [POKEMON_DATA[0], POKEMON_DATA[1], POKEMON_DATA[2]];
  const enemySpecies = [POKEMON_DATA[randomInt(POKEMON_DATA.length)], POKEMON_DATA[randomInt(3)], POKEMON_DATA[4]];

  return {
    phase: 'battle_intro',
    playerTeam: playerSpecies.map((pokemon, idx) => toBattlePokemon(pokemon, `p${idx}`, idx === 0 && Boolean(pokemon.gigantamaxMoveId))),
    enemyTeam: enemySpecies.map((pokemon, idx) => toBattlePokemon(pokemon, `e${idx}`, idx === 0 && Boolean(pokemon.gigantamaxMoveId))),
    playerActive: 0,
    enemyActive: 0,
    turn: 1,
    winner: null,
    pendingMessage: '야생 트레이너와 배틀 시작!',
  };
};

const firstAlive = (team: BattlePokemon[]) => team.findIndex((p) => !p.fainted);

export const chooseSwitch = (battle: BattleState, toIndex: number): BattleState => {
  const canSwitch = toIndex >= 0 && toIndex < battle.playerTeam.length && !battle.playerTeam[toIndex].fainted;
  if (!canSwitch || toIndex === battle.playerActive) return battle;

  return {
    ...battle,
    playerActive: toIndex,
    phase: 'choose_action',
    pendingMessage: `${battle.playerTeam[toIndex].name}(으)로 교체! 행동을 선택하세요.`,
  };
};

export const resolveTurn = (battle: BattleState, playerMoveIndex: number): { next: BattleState; events: EngineEvent[] } => {
  if (battle.phase !== 'choose_move') return { next: battle, events: [] };

  const player = battle.playerTeam[battle.playerActive];
  const enemy = battle.enemyTeam[battle.enemyActive];
  const aiMoveIndex = selectAiMoveIndex(enemy);
  const queue = [
    { side: 'player' as const, speed: player.speed, priority: player.moves[playerMoveIndex]?.moveId === 'quick-attack' ? 1 : 0, moveIndex: playerMoveIndex },
    { side: 'enemy' as const, speed: enemy.speed, priority: enemy.moves[aiMoveIndex]?.moveId === 'quick-attack' ? 1 : 0, moveIndex: aiMoveIndex },
  ].sort((a, b) => b.priority - a.priority || b.speed - a.speed);

  let working: BattleState = { ...battle, playerTeam: [...battle.playerTeam], enemyTeam: [...battle.enemyTeam], phase: 'action_resolution' };
  const events: EngineEvent[] = [{ type: 'TURN_LOCKED' }];

  for (const action of queue) {
    const attacker = action.side === 'player' ? working.playerTeam[working.playerActive] : working.enemyTeam[working.enemyActive];
    const defender = action.side === 'player' ? working.enemyTeam[working.enemyActive] : working.playerTeam[working.playerActive];
    if (attacker.fainted || defender.fainted) continue;

    events.push({ type: 'MOVE_PREPARE', payload: { side: action.side } });
    const resolved = resolveMove({ attacker, defender, moveIndex: action.moveIndex });
    events.push(...resolved.events, { type: 'SOUND_HINT', payload: { cue: 'hit' } });

    if (action.side === 'player') {
      working.playerTeam[working.playerActive] = resolved.nextAttacker;
      working.enemyTeam[working.enemyActive] = resolved.nextDefender;
    } else {
      working.enemyTeam[working.enemyActive] = resolved.nextAttacker;
      working.playerTeam[working.playerActive] = resolved.nextDefender;
    }
  }

  const nextEnemy = firstAlive(working.enemyTeam);
  const nextPlayer = firstAlive(working.playerTeam);

  if (nextEnemy < 0 || nextPlayer < 0) {
    return {
      next: {
        ...working,
        phase: 'battle_end',
        winner: nextEnemy < 0 ? 'player' : 'enemy',
        pendingMessage: nextEnemy < 0 ? '승리!' : '패배... ',
      },
      events,
    };
  }

  if (working.enemyTeam[working.enemyActive].fainted) {
    working.enemyActive = nextEnemy;
    events.push({ type: 'EFFECT_MESSAGE', text: `상대는 ${working.enemyTeam[nextEnemy].name}를 내보냈다!` });
  }

  if (working.playerTeam[working.playerActive].fainted) {
    working.phase = 'forced_switch';
    working.pendingMessage = '기절한 포켓몬을 교체하세요.';
    return { next: working, events };
  }

  return {
    next: {
      ...working,
      phase: 'turn_end',
      turn: working.turn + 1,
      pendingMessage: `턴 ${working.turn} 종료`,
    },
    events,
  };
};

export const continueBattleFlow = (battle: BattleState): BattleState => {
  if (battle.phase === 'battle_intro') return { ...battle, phase: 'turn_start', pendingMessage: '전투 준비!' };
  if (battle.phase === 'turn_start' || battle.phase === 'turn_end') return { ...battle, phase: 'choose_action', pendingMessage: '행동을 선택하세요.' };
  if (battle.phase === 'choose_action') return { ...battle, phase: 'choose_move', pendingMessage: '기술을 선택하세요.' };
  return battle;
};
