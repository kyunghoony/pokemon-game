import { useEffect } from 'react';
import { useGameController } from './hooks/useGameController';
import { BattleScene } from './ui/battle/BattleScene';
import { CollectionPanel } from './ui/collection/CollectionPanel';
import { EncounterScene } from './ui/encounter/EncounterScene';
import { ShopPanel } from './ui/shop/ShopPanel';
import { LogPanel } from './ui/shared/LogPanel';

const App = () => {
  const { state, purchase, stats, battle, encounter } = useGameController();

  useEffect(() => {
    if (battle.battle?.phase === 'turn_end') {
      const timer = setTimeout(() => battle.advancePhase(), 500);
      return () => clearTimeout(timer);
    }
  }, [battle]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>포켓몬 배틀 & 포획 리디자인</h1>
        <div className="meta">포획 {stats.capturedCount} / 고유 {stats.uniqueCount}</div>
      </header>
      <main className="game-layout">
        <div className="main-scenes">
          <BattleScene
            battle={battle.battle}
            events={battle.events}
            onStart={battle.startBattle}
            onAdvance={battle.advancePhase}
            onMove={battle.chooseMove}
            onSwitch={battle.doSwitch}
          />
          <EncounterScene
            encounter={encounter.encounter}
            events={encounter.events}
            inventory={state.inventory}
            onStart={encounter.startEncounter}
            onAdvance={encounter.advance}
            onThrow={encounter.throwBall}
            onNext={() => {
              encounter.resetEncounter();
              encounter.startEncounter();
            }}
          />
        </div>
        <aside className="side-panels">
          <ShopPanel inventory={state.inventory} onPurchase={purchase} />
          <CollectionPanel collection={state.collection} />
          <LogPanel logs={state.logs} />
        </aside>
      </main>
    </div>
  );
};

export default App;
