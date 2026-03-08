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
          <div className="battle-dialog battle-dialog-text">야생 포켓몬이 보이지 않는다...</div>
          <div className="battle-ui-lower single"><button className="menu-btn menu-btn-major" onClick={onBack}>월드로 돌아간다</button></div>
        </div>
      </section>
    );
  }

  const flashClass = encounter.rarity === 'mythical' ? 'flash-mythical' : encounter.rarity === 'rare' ? 'flash-rare' : 'flash-normal';

  return (
    <section className="battle-screen">
      <div className={`battle-stage-modern battle-bg-grass encounter-scene ${flashClass}`}>
        <div className="battle-parallax battle-parallax-far" />
        <div className="battle-parallax battle-parallax-near" />
        <div className="battle-platform enemy" />
        <div className="encounter-flash" />
        <div className={`battle-sprite-wrap enemy motion-entry-wild encounter-slide-in ${encounter.shiny ? 'special-aura-shiny' : ''}`}>
          <div className="battle-shadow enemy" />
          <img src={encounter.pokemon.sprites.front} alt={encounter.pokemon.name} className="battle-sprite front motion-idle" />
        </div>

        <div className="battle-hud-modern enemy pokemon-hud-box">
          <div className="hud-topline"><strong>{encounter.shiny ? '✨ ' : ''}{encounter.pokemon.name}</strong><span>Lv.{encounter.level}</span></div>
          <div className="hp-track"><div className="hp-fill" style={{ width: `${Math.round(encounter.hpRatio * 100)}%` }} /></div>
        </div>

        <div className="battle-dialog battle-dialog-text encounter-typewriter">야생의 {encounter.pokemon.name}이(가) 나타났다!</div>

        <div className="battle-ui-lower">
          <div className="battle-menu-grid command-grid">
            {encounter.phase === 'encounter_intro' ? <button className="menu-btn menu-btn-command" onClick={onAdvance}>계속</button> : <button className="menu-btn menu-btn-command" onClick={onBattle}>FIGHT</button>}
            <button className="menu-btn menu-btn-command" onClick={onCapture}>BAG</button>
            <button className="menu-btn menu-btn-command" onClick={onBattle}>POKéMON</button>
            <button className="menu-btn menu-btn-command" onClick={onBack}>RUN</button>
          </div>
        </div>
      </div>
    </section>
  );
};
