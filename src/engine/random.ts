export const randomFloat = () => Math.random();

export const weightedPick = <T>(items: T[], weightOf: (item: T) => number): T => {
  const total = items.reduce((sum, item) => sum + weightOf(item), 0);
  let cursor = Math.random() * total;

  for (const item of items) {
    cursor -= weightOf(item);
    if (cursor <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
};
