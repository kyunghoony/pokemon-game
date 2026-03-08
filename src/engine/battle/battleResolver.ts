import { MOVE_INDEX, STRUGGLE_MOVE } from '../../data/moves/moveData';
import type { BattlePokemon, EngineEvent } from '../../types/game';
import { getTypeEffectiveness } from './battleEffects';
import { randomFloat, randomInt } from '../shared/rng';

interface ResolveArgs {
  attacker: BattlePokemon;
  defender: BattlePokemon;
  moveIndex: number;
}

export const resolveMove = ({ attacker, defender, moveIndex }: ResolveArgs): { nextAttacker: BattlePokemon; nextDefender: BattlePokemon; events: EngineEvent[] } => {
  const chosen = attacker.moves[moveIndex];
  const move = chosen && chosen.pp > 0 ? MOVE_INDEX[chosen.moveId] : STRUGGLE_MOVE;

  const nextAttacker: BattlePokemon = {
    ...attacker,
    moves: attacker.moves.map((slot, idx) =>
      idx === moveIndex && slot.pp > 0 ? { ...slot, pp: Math.max(0, slot.pp - 1) } : slot,
    ),
  };

  const events: EngineEvent[] = [{ type: 'MOVE_USED', text: `${attacker.name}의 ${move.name}!`, payload: { category: move.category, moveType: move.type } }];

  if (move.accuracy < 1 && randomFloat() > move.accuracy) {
    return {
      nextAttacker,
      nextDefender: defender,
      events: [...events, { type: 'EFFECT_MESSAGE', text: `${attacker.name}의 공격이 빗나갔다!` }],
    };
  }

  if (move.power === 0 && move.healRatio) {
    const heal = Math.floor(attacker.maxHp * move.healRatio);
    return {
      nextAttacker: { ...nextAttacker, hp: Math.min(attacker.maxHp, attacker.hp + heal) },
      nextDefender: defender,
      events: [
        ...events,
        { type: 'PROJECTILE_FIRED', payload: { category: move.category, moveType: move.type } },
        { type: 'EFFECT_MESSAGE', text: `${attacker.name}의 체력이 회복됐다!` },
        { type: 'DAMAGE_APPLIED', text: `${attacker.name} 체력 +${heal}` },
      ],
    };
  }

  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  const attackStat = attacker.status === 'burn' ? Math.floor(attacker.attack * 0.82) : attacker.attack;
  const base = Math.max(1, Math.floor((move.power * attackStat) / Math.max(1, defender.defense)));
  const isCrit = randomFloat() < 0.14;
  const critMod = isCrit ? 1.7 : 1;
  const damage = Math.max(1, Math.floor(base * effectiveness * critMod * 0.35));
  const hp = Math.max(0, defender.hp - damage);

  let result = `${defender.name} -${damage}`;
  if (isCrit) result += ' CRIT!';
  if (effectiveness > 1) result += ' 효과 굉장함!';
  if (effectiveness < 1) result += ' 효과 별로...';

  let nextDefender: BattlePokemon = { ...defender, hp, fainted: hp <= 0 };
  if (!nextDefender.fainted && nextDefender.status === 'none') {
    const statusRoll = randomFloat();
    if (move.type === '불꽃' && statusRoll < 0.18) nextDefender = { ...nextDefender, status: 'burn' };
    else if (move.type === '전기' && statusRoll < 0.18) nextDefender = { ...nextDefender, status: 'paralysis' };
    else if ((move.type === '에스퍼' || move.id === 'recover') && statusRoll < 0.12) {
      nextDefender = { ...nextDefender, status: 'sleep', sleepTurns: randomInt(3) + 1 };
    }
  }

  const resolved: EngineEvent[] = [
    ...events,
    { type: 'PROJECTILE_FIRED', payload: { category: move.category, moveType: move.type } },
    { type: 'HIT_CONFIRMED' },
    { type: 'HP_ANIM_START', payload: { from: defender.hp, to: hp } },
    { type: 'DAMAGE_APPLIED', text: result, payload: { damage } },
    { type: 'HP_ANIM_END', payload: { hp } },
  ];

  if (nextDefender.status !== defender.status) {
    const statusText = nextDefender.status === 'burn' ? '화상' : nextDefender.status === 'paralysis' ? '마비' : '수면';
    resolved.push({ type: 'EFFECT_MESSAGE', text: `${defender.name} ${statusText} 상태!` });
  }

  if (nextDefender.fainted) {
    resolved.push({ type: 'POKEMON_FAINTED', text: `${defender.name} 기절!` });
  }

  if (move.id === 'struggle') {
    const recoil = Math.max(1, Math.floor(nextAttacker.maxHp * 0.12));
    const recoilHp = Math.max(0, nextAttacker.hp - recoil);
    return {
      nextAttacker: { ...nextAttacker, hp: recoilHp, fainted: recoilHp <= 0 },
      nextDefender,
      events: [...resolved, { type: 'EFFECT_MESSAGE', text: `발버둥 반동 ${recoil} 데미지` }],
    };
  }

  return { nextAttacker, nextDefender, events: resolved };
};
