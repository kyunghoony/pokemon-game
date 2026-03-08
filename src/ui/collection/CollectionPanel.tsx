interface Props { collection: string[] }

export const CollectionPanel = ({ collection }: Props) => (
  <section className="panel">
    <h3>컬렉션</h3>
    <p>총 포획: {collection.length}</p>
    <p>고유 도감: {new Set(collection).size}</p>
  </section>
);
