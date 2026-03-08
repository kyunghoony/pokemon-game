import { CollectionPanel } from './ui/components/CollectionPanel';
import { EncounterPanel } from './ui/components/EncounterPanel';
import { Header } from './ui/components/Header';
import { LogPanel } from './ui/components/LogPanel';
import { ShopPanel } from './ui/components/ShopPanel';
import { useGameController } from './ui/hooks/useGameController';

const App = () => {
  const { state, stats, startEncounter, throwBall, purchase } = useGameController();

  return (
    <div className="app-shell">
      <Header
        state={state}
        capturedCount={stats.capturedCount}
        uniqueCount={stats.uniqueCount}
        onStartEncounter={startEncounter}
      />
      <main className="grid">
        <EncounterPanel state={state} onThrowBall={throwBall} />
        <ShopPanel state={state} onPurchase={purchase} />
        <CollectionPanel state={state} />
        <LogPanel state={state} />
      </main>
    </div>
  );
};

export default App;
