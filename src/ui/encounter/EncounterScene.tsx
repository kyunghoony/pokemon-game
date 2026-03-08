import type { CaptureEncounter } from '../../types/game';

interface Props {
  encounter: CaptureEncounter | null;
  onAdvance: () => void;
  onCapture: () => void;
  onBattle: () => void;
  onBack: () => void;
}

export const EncounterScene = ({ encounter, onAdvance, onCapture, onBattle, onBack }: Props) => {
  if (!encounter) {
    return (
      <section className="battle-screen">
        <div className="battle-stage-modern battle-bg-grass">
          <div className="battle-dialog">야생 포켓몬이 보이지 않는다...</div>
          <div className="battle-ui-lower single"><button className="menu-btn" onClick={onBack}>월드로 돌아간다</button></div>
        </div>
      </section>
    );
  }

  return (
    <section className="battle-screen">
      <div className={`battle-stage-modern battle-bg-grass ${encounter.rarity === 'mythical' ? 'flash-mythical' : encounter.rarity === 'rare' ? 'flash-rare' : 'flash-normal'}`}>
        <div className="battle-platform enemy" />
        <div className={`battle-sprite-wrap enemy motion-entry-wild ${encounter.shiny ? 'special-aura-shiny' : ''}`}>
          <img src={encounter.pokemon.sprites.front} alt={encounter.pokemon.name} className="battle-sprite front motion-idle" />
        </div>

        <div className="battle-hud-modern enemy">
          <strong>{encounter.shiny ? '✨ ' : ''}{encounter.pokemon.name} Lv.{encounter.level}</strong>
          <div className="hp-track"><div className="hp-fill" style={{ width: `${Math.round(encounter.hpRatio * 100)}%` }} /></div>
        </div>

        <div className="battle-dialog">야생의 {encounter.pokemon.name}이(가) 나타났다!</div>

        <div className="battle-ui-lower">
          <div className="battle-menu-grid">
            {encounter.phase === 'encounter_intro' ? <button className="menu-btn" onClick={onAdvance}>계속</button> : <button className="menu-btn" onClick={onBattle}>FIGHT</button>}
            <button className="menu-btn" onClick={onCapture}>BAG</button>
            <button className="menu-btn" onClick={onBattle}>POKéMON</button>
            <button className="menu-btn" onClick={onBack}>RUN</button>
          </div>
        </div>
      </div>
    </section>
  );
};
