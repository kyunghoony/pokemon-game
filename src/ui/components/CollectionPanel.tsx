import type { GameState } from '../../types/game';

interface CollectionPanelProps {
  state: GameState;
}

export const CollectionPanel = ({ state }: CollectionPanelProps) => {
  const uniques = [...new Map(state.collection.map((pokemon) => [pokemon.id, pokemon])).values()];

  return (
    <section className="panel">
      <h2>컬렉션</h2>
      {uniques.length === 0 ? (
        <p>아직 포획한 포켓몬이 없습니다.</p>
      ) : (
        <ul>
          {uniques.map((pokemon) => (
            <li key={pokemon.id}>
              #{pokemon.dex} {pokemon.name} ({pokemon.region})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
