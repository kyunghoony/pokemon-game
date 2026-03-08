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
      <section className="scene-card scene-focus">
        <h2>EncounterScene</h2>
        <p>조우 대상이 없습니다.</p>
        <button className="game-btn" onClick={onBack}>월드로 복귀</button>
      </section>
    );
  }

  return (
    <section className="scene-card scene-focus encounter-cinematic">
      <h2>EncounterScene</h2>
      <div className={`encounter-stage ${encounter.rarity === 'mythical' ? 'flash-mythical' : encounter.rarity === 'rare' ? 'flash-rare' : 'flash-normal'}`}>
        <div className="encounter-bg" />
        <div className={`wild-mon motion-idle motion-entry-wild ${encounter.shiny ? 'special-aura-shiny' : encounter.rarity !== 'normal' ? 'special-aura-rare' : ''}`}>{encounter.shiny ? '✨ ' : ''}{encounter.pokemon.name}</div>
        <div className="rarity-indicator pulse-chip">{encounter.rarity.toUpperCase()} · Lv.{encounter.level}</div>
      </div>
      <p>{encounter.resultText}</p>
      {encounter.phase === 'encounter_intro' && <button className="game-btn" onClick={onAdvance}>등장 연출 진행</button>}
      <div className="actions">
        <button className="game-btn primary pulse-select" onClick={onCapture}>포획 선택</button>
        <button className="game-btn" onClick={onBattle}>배틀 선택</button>
        <button className="game-btn" onClick={onBack}>월드로 복귀</button>
      </div>
    </section>
  );
};
