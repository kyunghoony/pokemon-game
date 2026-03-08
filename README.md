# Pokemon Battle & Capture Game (Vite + React + TS)

## 1차 리디자인 요약
이번 마일스톤은 **로그 중심 수집 게임**에서 **전투/포획 장면 중심 인터랙티브 게임**으로의 전환에 집중했습니다.

- 전투: turn/phase 기반 state machine 도입
- 포획: 조우-볼선택-투척-흔들림-성공/탈출 단계화
- UI: 관리형 패널 중심에서 scene 중심 레이아웃으로 전환
- 저장: localStorage 버전 필드(version=2) 추가

## 아키텍처
```
src/
  data/
    pokemonData.ts
    moves/moveData.ts
    items/itemData.ts
  engine/
    battle/
      battleMachine.ts
      battleResolver.ts
      battleEffects.ts
      ai.ts
    capture/
      captureMachine.ts
      captureResolver.ts
    shared/
      rng.ts
    gameState.ts
    shopEngine.ts
  hooks/
    useGameController.ts
    useBattleController.ts
    useEncounterController.ts
  ui/
    battle/BattleScene.tsx
    encounter/EncounterScene.tsx
    collection/CollectionPanel.tsx
    shop/ShopPanel.tsx
    shared/LogPanel.tsx
```

## 상태 머신 설계
### Battle phase
- battle_intro
- turn_start
- choose_action
- choose_move
- action_resolution
- forced_switch
- turn_end
- battle_end

추가 규칙:
- PP 소모, PP 고갈 시 발버둥
- 발버둥 반동 데미지
- 속도 + 우선도에 따른 행동 순서
- 기절 직후 자동 연속 공격 금지, forced switch로 분기

### Capture phase
- encounter_intro
- ball_select
- throwing
- capture_roll
- shake_1~3 (event)
- caught / breakout
- encounter_continue

포획 확률 적용 순서(코드에 명시):
1. baseChance (포켓몬 고유)
2. charmBonus
3. retryBonus
4. ballBonus
5. finalChance clamp
6. roll 비교

## UX 리디자인 포인트
- 배경/포켓몬/FX/커맨드 레이어 분리
- 기술 사용 시 타격/데미지 팝업 애니메이션
- 포획 시 투척 궤적 + 흔들림 단계 표시
- 모바일: 하단 중심 액션 밀도 유지

## 마이그레이션 플랜
1. 데이터 분리: 포켓몬/기술/볼을 독립 데이터 파일로 이동
2. 엔진 분리: battle/capture 로직을 UI와 분리
3. UI 장면화: 전투/포획 scene 컴포넌트 도입
4. 점진 확장: moves/pokemon DB 확장, 상태이상/스킬 이펙트 확장
5. 향후: sound hook 및 canvas/webgl 렌더러 교체 가능

## 향후 확장 포인트
- `EngineEvent`를 통한 사운드 큐 연결
- `BattleAnimationLayer`, `DamagePopup` 컴포넌트 분리
- AI 전략 개선(교체/상성 고려)
- 전설/환상 전용 조우 연출 프리셋
