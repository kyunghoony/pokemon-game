# pokemon-game (Vite + React + TypeScript)

기존 단일 `index.html` 게임을 **유지보수 가능한 프론트엔드 앱 구조**로 재구성한 초기 베이스입니다.

- 배포 대상: **Vercel**
- 향후 계획: **Neon(PostgreSQL) 연동**
- 현재 상태: 기존 로직을 바로 이식하기 좋은 `data / engine / ui` 계층 분리 완료

## 실행 방법

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
npm run preview
```

## 폴더 구조

```text
.
├─ docs/
│  └─ legacy-single-file-index.html   # 이전 단일 HTML 원본 백업
├─ src/
│  ├─ data/                            # 정적 데이터/사전 정의값
│  │  ├─ pokemonData.ts
│  │  └─ shopData.ts
│  ├─ engine/                          # 순수 게임 로직(비즈니스 규칙)
│  │  ├─ catchEngine.ts
│  │  ├─ encounterEngine.ts
│  │  ├─ gameState.ts
│  │  ├─ random.ts
│  │  └─ shopEngine.ts
│  ├─ types/
│  │  └─ game.ts
│  ├─ ui/
│  │  ├─ components/                   # 화면 컴포넌트
│  │  └─ hooks/                        # 상태 orchestration
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ styles.css
├─ index.html                          # Vite 엔트리
├─ vercel.json
└─ vite.config.ts
```

## 기존 index.html 로직 분리 기준 (권장)

기존 단일 파일의 로직을 아래 기준으로 점진 이전하면 됩니다.

### 1) `data` 계층

- 대상: 포켓몬 도감 원본, 타입 상성표, 상점 아이템 목록, 밸런스 상수
- 원칙:
  - **순수 데이터만** 둔다 (함수/DOM 접근 금지)
  - 향후 Neon 도입 시, `data`는 로컬 fallback 또는 seed 용도로 축소 가능

예시:
- `pokemonRawData.ts`
- `typeChart.ts`
- `economyConfig.ts`

### 2) `engine` 계층

- 대상: 포획 확률 계산, 조우 가중치 뽑기, 상점 구매 처리, 배틀 판정
- 원칙:
  - 입력과 출력이 명확한 **순수 함수** 중심
  - React, DOM, localStorage 의존성 제거
  - 테스트 작성이 쉬운 형태 유지

예시:
- `catchEngine.ts`: `tryCatch(pokemon, ballType)`
- `encounterEngine.ts`: `createEncounter(pool)`
- `shopEngine.ts`: `buyItem(state, itemId)`

### 3) `ui` 계층

- 대상: 컴포넌트 렌더링, 사용자 이벤트, 상태 연결
- 원칙:
  - `useGameController` 같은 훅에서 `engine` 함수 조합
  - 컴포넌트는 props 기반으로 최대한 dumb 하게 유지

예시:
- `ui/hooks/useGameController.ts`
- `ui/components/*`

## Vercel 배포

이미 `vercel.json`이 포함되어 있어 기본 빌드가 가능합니다.

- Framework: `vite`
- Build Command: `npm run build`
- Output: `dist`

## Neon 연동 확장 포인트

추후 서버/DB를 붙일 때 권장 흐름:

1. `/api/*` (Vercel Functions 또는 별도 백엔드)에서 Neon 접근
2. 프론트는 `src/services/`를 추가해서 API 호출 분리
3. `engine`은 그대로 유지하고, 데이터 입수 방식만 API로 교체

추천 추가 디렉토리:

```text
src/
├─ services/
│  ├─ apiClient.ts
│  ├─ trainerService.ts
│  └─ collectionService.ts
└─ features/
   ├─ encounter/
   ├─ battle/
   └─ collection/
```

## 마이그레이션 팁

- `docs/legacy-single-file-index.html`을 기준으로, 기능 단위(조우/포획/상점/배틀/도감)로 잘라 단계적으로 이전하세요.
- 먼저 데이터 상수들을 `src/data`로 옮긴 뒤, 해당 상수를 참조하는 계산 함수를 `src/engine`으로 이동하면 충돌이 적습니다.
