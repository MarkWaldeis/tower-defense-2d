import { GameSaveState } from '../types/game';

const SAVE_KEY = 'TOWER_DEFENSE_2D_SAVE_V1';

const DEFAULT_SAVE: GameSaveState = {
  levels: {
    1: { unlocked: true, stars: 0, highScore: 0, highestWave: 0 },
    2: { unlocked: false, stars: 0, highScore: 0, highestWave: 0 }
  },
  soundEnabled: true,
  totalKills: 0,
  totalGoldEarned: 0
};

export class SaveManager {
  private static instance: SaveManager;
  private state: GameSaveState;

  private constructor() {
    this.state = this.load();
  }

  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  public load(): GameSaveState {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (data) {
        return { ...DEFAULT_SAVE, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('LocalStorage save load failed, using defaults', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SAVE));
  }

  public save(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  public getLevel(levelId: number) {
    return this.state.levels[levelId] || { unlocked: false, stars: 0, highScore: 0, highestWave: 0 };
  }

  public recordVictory(levelId: number, stars: number, score: number, kills: number, gold: number): void {
    if (!this.state.levels[levelId]) {
      this.state.levels[levelId] = { unlocked: true, stars: 0, highScore: 0, highestWave: 0 };
    }
    const current = this.state.levels[levelId];
    current.stars = Math.max(current.stars, stars);
    current.highScore = Math.max(current.highScore, score);

    // Unlock next level
    const nextLevelId = levelId + 1;
    if (!this.state.levels[nextLevelId]) {
      this.state.levels[nextLevelId] = { unlocked: true, stars: 0, highScore: 0, highestWave: 0 };
    } else {
      this.state.levels[nextLevelId].unlocked = true;
    }

    this.state.totalKills += kills;
    this.state.totalGoldEarned += gold;
    this.save();
  }

  public recordWave(levelId: number, wave: number, score: number): void {
    if (!this.state.levels[levelId]) {
      this.state.levels[levelId] = { unlocked: true, stars: 0, highScore: 0, highestWave: 0 };
    }
    const current = this.state.levels[levelId];
    current.highestWave = Math.max(current.highestWave, wave);
    current.highScore = Math.max(current.highScore, score);
    this.save();
  }

  public getSoundEnabled(): boolean {
    return this.state.soundEnabled;
  }

  public setSoundEnabled(val: boolean): void {
    this.state.soundEnabled = val;
    this.save();
  }
}
