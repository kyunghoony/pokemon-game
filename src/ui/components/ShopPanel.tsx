import { SHOP_ITEMS } from '../../data/shopData';
import type { GameState } from '../../types/game';

interface ShopPanelProps {
  state: GameState;
  onPurchase: (itemId: string) => void;
}

export const ShopPanel = ({ state, onPurchase }: ShopPanelProps) => {
  return (
    <section className="panel">
      <h2>상점</h2>
      <div className="shop-grid">
        {SHOP_ITEMS.map((item) => (
          <button key={item.id} onClick={() => onPurchase(item.id)} disabled={state.coins < item.price}>
            {item.title} - {item.price} 코인
          </button>
        ))}
      </div>
    </section>
  );
};
