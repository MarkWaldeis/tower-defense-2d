export type TowerType = 'SLINGER' | 'CROSSBOW' | 'MAGE' | 'MORTAR';

export type TargetingMode = 'FIRST' | 'LAST' | 'STRONGEST' | 'WEAKEST' | 'CLOSEST';

export type EnemyType = 'GOBLIN' | 'SCUTTER' | 'GOLEM' | 'VULTURE' | 'SORCERER';

export interface TowerStats {
  id: TowerType;
  name: string;
  icon: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number; // Attacks per second
  description: string;
  special: string;
  upgradeCostMult: number;
  damageMultPerLevel: number;
  rangeMultPerLevel: number;
}

export interface EnemyStats {
  id: EnemyType;
  name: string;
  hp: number;
  speed: number;
  armor: number; // Flat or % damage reduction
  magicResist: number;
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

export interface BuildSpot {
  id: number;
  x: number;
  y: number;
  occupied: boolean;
  towerId?: string;
}

export interface MapData {
  id: number;
  name: string;
  region: string;
  description: string;
  waypoints: Point[];
  buildSpots: Point[];
  startGold: number;
  startLives: number;
  totalWaves: number;
}

export interface WaveUnitConfig {
  type: EnemyType;
  count: number;
  interval: number;
  delayBefore: number;
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
  starsCount: number;
}
