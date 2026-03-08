const TYPE_TABLE: Record<string, Record<string, number>> = {
  불꽃: { 풀: 2, 물: 0.5 },
  물: { 불꽃: 2, 풀: 0.5 },
  풀: { 물: 2, 불꽃: 0.5 },
  전기: { 물: 2, 풀: 0.5 },
  에스퍼: { 독: 2 },
};

export const getTypeEffectiveness = (attackType: string, defendTypes: string[]): number =>
  defendTypes.reduce((acc, defendType) => acc * (TYPE_TABLE[attackType]?.[defendType] ?? 1), 1);

export const colorByType = (type: string): string => {
  if (type === '불꽃') return '#ff7a45';
  if (type === '물') return '#4c9fff';
  if (type === '풀') return '#6fd66f';
  if (type === '전기') return '#ffd447';
  if (type === '에스퍼') return '#db7eff';
  return '#dddddd';
};
