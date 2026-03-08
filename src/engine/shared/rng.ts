export const randomFloat = () => Math.random();

export const randomInt = (maxExclusive: number) => Math.floor(randomFloat() * maxExclusive);

export const weightedPick = <T>(items: T[], getWeight: (item: T) => number): T => {
  const total = items.reduce((sum, item) => sum + Math.max(0, getWeight(item)), 0);
  let roll = randomFloat() * total;

  for (const item of items) {
    roll -= Math.max(0, getWeight(item));
    if (roll <= 0) {
      return item;
    }
  }
  return items[items.length - 1];
};
