import Phaser from 'phaser';
import { WaveConfig, EnemyType, Point } from '../types/game';
import { Enemy } from '../entities/enemies/Enemy';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';

interface SpawnQueueItem {
  type: EnemyType;
  spawnTime: number;
}

export class WaveManager {
  private waves: WaveConfig[];
  public currentWaveIndex: number = 0;
  public isWaveInProgress: boolean = false;
  private spawnQueue: SpawnQueueItem[] = [];
  private currentTime: number = 0;

  private onEnemySpawnCallback?: (type: EnemyType) => void;
  private onWaveCompleteCallback?: (waveNumber: number, reward: number) => void;
  private onAllWavesCompleteCallback?: () => void;
  private onWaveStartCallback?: (waveNumber: number, isBoss: boolean) => void;

  constructor(_scene: Phaser.Scene, waves: WaveConfig[], _waypoints: Point[]) {
    this.waves = waves;
  }

  public setCallbacks(
    onEnemySpawn: (type: EnemyType) => void,
    onWaveComplete: (waveNumber: number, reward: number) => void,
    onAllWavesComplete: () => void,
    onWaveStart: (waveNumber: number, isBoss: boolean) => void
  ): void {
    this.onEnemySpawnCallback = onEnemySpawn;
    this.onWaveCompleteCallback = onWaveComplete;
    this.onAllWavesCompleteCallback = onAllWavesComplete;
    this.onWaveStartCallback = onWaveStart;
  }

  public get totalWaves(): number {
    return this.waves.length;
  }

  public get currentWaveNumber(): number {
    return this.currentWaveIndex + 1;
  }

  public startNextWave(): boolean {
    if (this.currentWaveIndex >= this.waves.length) {
      return false;
    }

    const wave = this.waves[this.currentWaveIndex];
    this.isWaveInProgress = true;
    this.spawnQueue = [];
    this.currentTime = 0;

    // Build spawn timeline
    wave.groups.forEach(group => {
      let delay = group.delayBefore;
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push({
          type: group.type,
          spawnTime: delay
        });
        delay += group.interval;
      }
    });

    this.spawnQueue.sort((a, b) => a.spawnTime - b.spawnTime);

    SoundSynthesizer.getInstance().playWaveHorn();

    if (this.onWaveStartCallback) {
      this.onWaveStartCallback(wave.waveNumber, !!wave.isBossWave);
    }

    return true;
  }

  public update(delta: number, activeEnemies: Enemy[]): void {
    if (!this.isWaveInProgress) return;

    this.currentTime += delta;

    // Process spawn queue
    while (this.spawnQueue.length > 0 && this.spawnQueue[0].spawnTime <= this.currentTime) {
      const item = this.spawnQueue.shift()!;
      if (this.onEnemySpawnCallback) {
        this.onEnemySpawnCallback(item.type);
      }
    }

    // Check if wave is completed (queue empty AND all active enemies dead/despawned)
    if (this.spawnQueue.length === 0 && activeEnemies.length === 0) {
      this.completeCurrentWave();
    }
  }

  private completeCurrentWave(): void {
    const wave = this.waves[this.currentWaveIndex];
    this.isWaveInProgress = false;

    if (this.onWaveCompleteCallback) {
      this.onWaveCompleteCallback(wave.waveNumber, wave.rewardBonus);
    }

    this.currentWaveIndex++;

    if (this.currentWaveIndex >= this.waves.length) {
      if (this.onAllWavesCompleteCallback) {
        this.onAllWavesCompleteCallback();
      }
    }
  }
}
