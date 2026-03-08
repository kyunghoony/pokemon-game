import { useMemo, useState } from 'react';
import { useGameController } from './hooks/useGameController';
import { BattleScene } from './ui/battle/BattleScene';
import { CollectionPanel } from './ui/collection/CollectionPanel';
import { CaptureScene } from './ui/encounter/CaptureScene';
import { EncounterScene } from './ui/encounter/EncounterScene';
import { ShopPanel } from './ui/shop/ShopPanel';

type Scene = 'title' | 'world' | 'encounter' | 'battle' | 'capture' | 'shop' | 'collection';
type Transition = 'fade' | 'slide-left' | 'slide-right' | 'zoom';

const getTransition = (from: Scene, to: Scene): Transition => {
  if (from === 'title' && to === 'world') return 'zoom';
  if (from === 'world' && ['encounter', 'battle', 'shop', 'collection'].includes(to)) return 'slide-left';
  if (to === 'world') return 'slide-right';
  if (from === 'encounter' && to === 'capture') return 'fade';
  return 'fade';
};

const App = () => {
  const { state, purchase, stats, battle, encounter } = useGameController();
  const [currentScene, setCurrentScene] = useState<Scene>('title');
  const [transition, setTransition] = useState<Transition>('fade');

  const navigate = (next: Scene) => {
    setTransition(getTransition(currentScene, next));
    setCurrentScene(next);
  };

  const sceneTitle = useMemo(() => {
    if (currentScene === 'title') return 'TitleScene';
    if (currentScene === 'world') return 'WorldScene';
    if (currentScene === 'encounter') return 'EncounterScene';
    if (currentScene === 'battle') return 'BattleScene';
    if (currentScene === 'capture') return 'CaptureScene';
    if (currentScene === 'shop') return 'ShopScene';
    return 'CollectionScene';
  }, [currentScene]);

  return (
    <div className="app-shell game-root">
      <header className="topbar">
        <h1>포켓몬 Scene UI</h1>
        <div className="meta">현재: {sceneTitle} · 포획 {stats.capturedCount} / 고유 {stats.uniqueCount}</div>
      </header>

      <main className={`scene-frame transition-${transition}`} key={currentScene}>
        {currentScene === 'title' && (
          <section className="scene-card scene-focus title-scene">
            <h2>TitleScene</h2>
            <p>포켓몬 월드로 입장해 탐험, 배틀, 포획을 진행하세요.</p>
            <button className="game-btn primary" onClick={() => navigate('world')}>게임 시작</button>
          </section>
        )}

        {currentScene === 'world' && (
          <section className="scene-card scene-focus world-scene">
            <h2>WorldScene</h2>
            <div className="actions grid2">
              <button className="game-btn primary" onClick={() => { encounter.startEncounter(); navigate('encounter'); }}>탐험 시작</button>
              <button className="game-btn" onClick={() => { battle.startBattle(); navigate('battle'); }}>배틀 시작</button>
              <button className="game-btn" onClick={() => navigate('shop')}>상점 이동</button>
              <button className="game-btn" onClick={() => navigate('collection')}>컬렉션 이동</button>
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
          <div className="scene-stack">
            <ShopPanel inventory={state.inventory} onPurchase={purchase} />
            <div className="scene-actions"><button className="game-btn" onClick={() => navigate('world')}>월드로 복귀</button></div>
          </div>
        )}

        {currentScene === 'collection' && (
          <div className="scene-stack">
            <CollectionPanel collection={state.collection} />
            <div className="scene-actions"><button className="game-btn" onClick={() => navigate('world')}>월드로 복귀</button></div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
