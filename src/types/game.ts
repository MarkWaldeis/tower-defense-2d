export type TowerType = 'GATLING' | 'LASER' | 'ROCKET' | 'CRYO' | 'TESLA';

export type TargetingMode = 'FIRST' | 'LAST' | 'STRONGEST' | 'WEAKEST' | 'CLOSEST';

export type EnemyType = 'SCOUT' | 'RAIDER' | 'TANK' | 'BOSS' | 'SHIELD_DRONE';

export interface TowerStats {
  id: TowerType;
  name: string;
  icon: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number; // Attacks per second
  description: string;
  special?: string;
  upgradeCostMult: number;
  damageMultPerLevel: number;
  rangeMultPerLevel: number;
}

export interface EnemyStats {
  id: EnemyType;
  name: string;
  hp: number;
  speed: number; // Pixels per second
  armor: number; // Flat or % damage reduction
  goldReward: number;
  scoreReward: number;
  size: number;
  color: number;
  description: string;
  isBoss?: boolean;
}

export interface Point {
  x: number;
  y: number;
}

export interface GridCoord {
  col: number;
  row: number;
}

export enum TileType {
  BUILDABLE = 0,
  PATH = 1,
  OBSTACLE = 2,
  SPAWN = 3,
  BASE = 4
}

export interface MapData {
  id: number;
  name: string;
  subtitle: string;
  cols: number;
  rows: number;
  tileSize: number;
  tiles: number[][];
  waypoints: Point[];
  startGold: number;
  startLives: number;
  totalWaves: number;
}

export interface WaveUnitConfig {
  type: EnemyType;
  count: number;
  interval: number; // ms between spawns
  delayBefore: number; // ms before this group starts
}

export interface WaveConfig {
  waveNumber: number;
  groups: WaveUnitConfig[];
  rewardBonus: number;
  isBossWave?: boolean;
}

export interface LevelSaveData {
  unlocked: boolean;
  stars: number;
  highScore: number;
  highestWave: number;
}

export interface GameSaveState {
  levels: Record<number, LevelSaveData>;
  soundEnabled: boolean;
  totalKills: number;
  totalGoldEarned: number;
}
