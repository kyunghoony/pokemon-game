import type { Pokemon } from '../types/game';

/**
 * 기존 index.html의 대형 POKEMON_RAW_DATA를 이 파일로 이전하는 것을 전제로 한 시작점입니다.
 * 지금은 구조 예시를 위해 샘플 데이터만 넣어 두었습니다.
 */
export const POKEMON_DATA: Pokemon[] = [
  { id: 'bulbasaur', dex: 1, name: '이상해씨', region: '관동', types: ['풀', '독'], catchRate: 0.45, spawnWeight: 5 },
  { id: 'charmander', dex: 4, name: '파이리', region: '관동', types: ['불꽃'], catchRate: 0.42, spawnWeight: 5 },
  { id: 'squirtle', dex: 7, name: '꼬부기', region: '관동', types: ['물'], catchRate: 0.45, spawnWeight: 5 },
  { id: 'pikachu', dex: 25, name: '피카츄', region: '관동', types: ['전기'], catchRate: 0.35, spawnWeight: 4 },
  { id: 'mewtwo', dex: 150, name: '뮤츠', region: '관동', types: ['에스퍼'], catchRate: 0.12, spawnWeight: 1 },
];
