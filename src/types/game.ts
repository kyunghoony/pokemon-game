export type Region = '관동' | '성도' | '호연' | '신오';

export type BallType = 'poke' | 'great' | 'ultra' | 'master';
export type MoveCategory = 'beam' | 'projectile' | 'slash' | 'status' | 'healing' | 'gigantamax' | 'struggle';
export type BattlePhase =
  | 'battle_intro'
  | 'turn_start'
  | 'choose_action'
  | 'choose_move'
  | 'choose_switch'
  | 'action_resolution'
  | 'hit_animation'
  | 'faint_check'
  | 'forced_switch'
  | 'turn_end'
  | 'battle_end';

export type CapturePhase =
  | 'encounter_intro'
  | 'ball_select'
  | 'throwing'
  | 'capture_roll'
  | 'shake_1'
  | 'shake_2'
  | 'shake_3'
  | 'caught'
  | 'breakout'
  | 'encounter_continue'
  | 'encounter_end';

export interface MoveData {
  id: string;
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  priority?: number;
  category: MoveCategory;
  healRatio?: number;
  isGigantamax?: boolean;
}

export interface PokemonSpecies {
  id: string;
  dex: number;
  name: string;
  region: Region;
  types: string[];
  catchRate: number;
  spawnWeight: number;
  baseHp: number;
  attack: number;
  defense: number;
  speed: number;
  movePool: string[];
  gigantamaxMoveId?: string;
  rarity?: 'normal' | 'legendary';
}

export interface BattlePokemon {
  uid: string;
  speciesId: string;
  name: string;
  types: string[];
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  moves: Array<{ moveId: string; pp: number; maxPp: number }>;
  isGigantamax: boolean;
  fainted: boolean;
}

export interface BallSpec {
  key: BallType;
  label: string;
  bonusRate: number;
  trailClass: string;
}

export interface ShopItem {
  id: string;
  title: string;
  price: number;
  ballType?: BallType;
  amount: number;
  currency?: 'rainbowCandy' | 'typeCandy';
}

export interface Inventory {
  balls: Record<BallType, number>;
  rainbowCandy: number;
  typeCandy: Record<string, number>;
  charmLevel: number;
}

export interface CaptureEncounter {
  pokemon: PokemonSpecies;
  phase: CapturePhase;
  selectedBall: BallType;
  shakes: number;
  resultText: string;
  rollContext?: {
    baseChance: number;
    charmBonus: number;
    retryBonus: number;
    ballBonus: number;
    finalChance: number;
    roll: number;
  };
  retries: number;
}

export interface BattleState {
  phase: BattlePhase;
  playerTeam: BattlePokemon[];
  enemyTeam: BattlePokemon[];
  playerActive: number;
  enemyActive: number;
  turn: number;
  winner: 'player' | 'enemy' | null;
  pendingMessage: string;
}

export interface GameState {
  version: number;
  inventory: Inventory;
  collection: string[];
  logs: string[];
  battle: BattleState | null;
  capture: CaptureEncounter | null;
}

export interface EngineEvent {
  type:
    | 'TURN_LOCKED'
    | 'MOVE_PREPARE'
    | 'MOVE_USED'
    | 'PROJECTILE_FIRED'
    | 'HIT_CONFIRMED'
    | 'DAMAGE_APPLIED'
    | 'HP_ANIM_START'
    | 'HP_ANIM_END'
    | 'EFFECT_MESSAGE'
    | 'POKEMON_FAINTED'
    | 'BALL_THROWN'
    | 'BALL_ABSORB'
    | 'BALL_SHAKE'
    | 'CAPTURE_SUCCESS'
    | 'CAPTURE_FAIL'
    | 'SOUND_HINT';
  text?: string;
  payload?: Record<string, string | number | boolean>;
}
