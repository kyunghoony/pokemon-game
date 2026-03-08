import { MOVE_INDEX } from '../../data/moves/moveData';
import type { BattlePokemon } from '../../types/game';
import { randomFloat } from '../shared/rng';
import { getTypeEffectiveness } from './battleEffects';

export const selectAiMoveIndex = (pokemon: BattlePokemon, defenderTypes: string[]): number => {
  const available = pokemon.moves
    .map((move, index) => {
      const data = MOVE_INDEX[move.moveId];
      const typeScore = data ? getTypeEffectiveness(data.type, defenderTypes) : 1;
      const powerScore = data?.power ?? 0;
      const statusBias = data?.category === 'status' ? 12 : 0;
      const randomBias = Math.floor(randomFloat() * 18);
      const score = powerScore + typeScore * 45 + statusBias + randomBias;
      return { index, pp: move.pp, score, category: data?.category };
    })
    .filter((move) => move.pp > 0);

  const useStatus = available.some((move) => move.category === 'status') && randomFloat() < 0.24;
  if (useStatus) {
    const statusMove = available.filter((move) => move.category === 'status').sort((a, b) => b.score - a.score)[0];
    if (statusMove) return statusMove.index;
  }

  available.sort((a, b) => b.score - a.score);
  if (available.length > 1 && randomFloat() < 0.2) return available[1].index;

  return available[0]?.index ?? -1;
};

export const evaluateAiSwitch = (team: BattlePokemon[], activeIndex: number): number | null => {
  const active = team[activeIndex];
  const lowHp = active.hp / Math.max(1, active.maxHp) < 0.3;
  if (!lowHp || randomFloat() > 0.35) return null;
  const options = team.map((p, idx) => ({ p, idx })).filter(({ p, idx }) => idx !== activeIndex && !p.fainted);
  if (!options.length) return null;
  options.sort((a, b) => b.p.hp / b.p.maxHp - a.p.hp / a.p.maxHp);
  return options[0].idx;
};
