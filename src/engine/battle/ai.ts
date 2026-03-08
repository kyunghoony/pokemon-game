import type { BattlePokemon } from '../../types/game';

export const selectAiMoveIndex = (pokemon: BattlePokemon): number => {
  const available = pokemon.moves
    .map((move, index) => ({ index, pp: move.pp }))
    .filter((move) => move.pp > 0)
    .sort((a, b) => b.pp - a.pp);

  return available[0]?.index ?? -1;
};
