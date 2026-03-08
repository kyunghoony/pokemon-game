import { useState } from 'react';
import { useGameController } from './hooks/useGameController';
import { BattleScene } from './ui/battle/BattleScene';
import { CollectionPanel } from './ui/collection/CollectionPanel';
import { CaptureScene } from './ui/encounter/CaptureScene';
import { EncounterScene } from './ui/encounter/EncounterScene';
import { ShopPanel } from './ui/shop/ShopPanel';
import { useSceneTransition, type Scene } from './ui/animation/useSceneTransition';

const App = () => {
  const { state, purchase, battle, encounter } = useGameController();
  const [currentScene, setCurrentScene] = useState<Scene>('title');
  const [previousScene, setPreviousScene] = useState<Scene>('title');

  const navigate = (next: Scene) => {
    setPreviousScene(currentScene);
    setCurrentScene(next);
  };

  const transition = useSceneTransition(previousScene, currentScene);

  return (
    <div className="app-shell game-root">
      <main className={`scene-frame ${transition}`} key={currentScene}>
        {currentScene === 'title' && (
          <section className="scene-card scene-focus title-scene motion-scene-enter">
            <h2>포켓몬 배틀 필드</h2>
            <p>야생 포켓몬을 만나고, 배틀과 포획을 통해 팀을 완성하세요.</p>
            <button className="game-btn primary pulse-select" onClick={() => navigate('world')}>게임 시작</button>
          </section>
        )}

        {currentScene === 'world' && (
          <section className="scene-card scene-focus world-scene world-hub motion-scene-enter">
            <h2>월드 맵</h2>
            <div className="world-aura" />
            <div className="actions grid2">
              <button className="game-btn primary hub-card pulse-select" onClick={() => { encounter.startEncounter(); navigate('encounter'); }}>탐험 시작</button>
              <button className="game-btn hub-card" onClick={() => { battle.startBattle(); navigate('battle'); }}>배틀 시작</button>
              <button className="game-btn hub-card" onClick={() => navigate('shop')}>상점 이동</button>
              <button className="game-btn hub-card" onClick={() => navigate('collection')}>컬렉션 이동</button>
            </div>
            <div className="status-row">
              <span className="phase-pill motion-reward-pop">추천: 탐험 시작</span>
              <span className="phase-pill motion-reward-pop">레인보우캔디: {state.inventory.rainbowCandy}</span>
            </div>
          </section>
        )}

        {currentScene === 'encounter' && (
          <EncounterScene
            encounter={encounter.encounter}
            onAdvance={encounter.advance}
            onBack={() => {
              encounter.resetEncounter();
              navigate('world');
            }}
            onCapture={() => {
              if (encounter.encounter?.phase === 'encounter_intro') encounter.advance();
              navigate('capture');
            }}
            onBattle={() => {
              battle.startBattle();
              encounter.resetEncounter();
              navigate('battle');
            }}
          />
        )}

        {currentScene === 'capture' && (
          <CaptureScene
            encounter={encounter.encounter}
            events={encounter.events}
            inventory={state.inventory}
            onAdvance={encounter.advance}
            onThrow={encounter.throwBall}
            onRetry={() => encounter.advance()}
            onFinish={() => {
              encounter.resetEncounter();
              navigate('world');
            }}
          />
        )}

        {currentScene === 'battle' && (
          <div className="scene-stack">
            <BattleScene
              battle={battle.battle}
              events={battle.events}
              inventory={state.inventory}
              onStart={battle.startBattle}
              onAdvance={battle.advancePhase}
              onMove={battle.chooseMove}
              onSwitch={battle.doSwitch}
            />
            <div className="scene-actions">
              <button className="game-btn" onClick={() => navigate('world')}>월드로 복귀</button>
            </div>
          </div>
        )}

        {currentScene === 'shop' && (
          <div className="scene-stack motion-scene-enter">
            <ShopPanel inventory={state.inventory} onPurchase={purchase} />
            <div className="scene-actions"><button className="game-btn" onClick={() => navigate('world')}>월드로 복귀</button></div>
          </div>
        )}

        {currentScene === 'collection' && (
          <div className="scene-stack motion-scene-enter">
            <CollectionPanel collection={state.collection} />
            <div className="scene-actions"><button className="game-btn" onClick={() => navigate('world')}>월드로 복귀</button></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
