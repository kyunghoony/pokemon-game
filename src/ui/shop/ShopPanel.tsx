import { SHOP_ITEMS } from '../../data/items/itemData';
import type { Inventory } from '../../types/game';

interface Props {
  inventory: Inventory;
  onPurchase: (id: string) => void;
}

export const ShopPanel = ({ inventory, onPurchase }: Props) => (
  <section className="panel">
    <h3>상점</h3>
    <p>무지개사탕: {inventory.rainbowCandy}</p>
    {SHOP_ITEMS.map((item) => (
      <button key={item.id} className="game-btn" onClick={() => onPurchase(item.id)}>
        {item.title} - {item.price}
      </button>
    ))}
  </section>
);
