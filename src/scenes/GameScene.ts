import Phaser from 'phaser';
import { MAPS, TOWERS_CONFIG, generateWaves } from '../config/GameConfig';
import { MapData, TowerType, EnemyType } from '../types/game';
import { GridManager } from '../systems/GridManager';
import { WaveManager } from '../systems/WaveManager';
import { JuiceManager } from '../systems/JuiceManager';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import { SaveManager } from '../systems/SaveManager';
import { Tower } from '../entities/towers/Tower';
import { Enemy } from '../entities/enemies/Enemy';
import { Bullet, Missile } from '../entities/projectiles/ProjectilePool';
import { UIScene } from './UIScene';

export class GameScene extends Phaser.Scene {
  public levelId: number = 1;
  public mapData!: MapData;

  // Systems
  public gridManager!: GridManager;
  public waveManager!: WaveManager;
  public juiceManager!: JuiceManager;
  private uiScene!: UIScene;

  // Game Economy & State
  public gold: number = 450;
  public lives: number = 20;
  public score: number = 0;
  public totalKills: number = 0;
  public gameSpeed: number = 1;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;

  // Entities
  public towers: Tower[] = [];
  public enemies: Enemy[] = [];
  public bulletPool: Bullet[] = [];
  public missilePool: Missile[] = [];

  // Interaction State
  private buildModeType: TowerType | null = null;
  private hoverCol: number = -1;
  private hoverRow: number = -1;

  constructor() {
    super('GameScene');
  }

  public init(data: { levelId?: number }): void {
    this.levelId = data.levelId || 1;
    this.mapData = MAPS.find(m => m.id === this.levelId) || MAPS[0];
    this.gold = this.mapData.startGold;
    this.lives = this.mapData.startLives;
    this.score = 0;
    this.totalKills = 0;
    this.gameSpeed = 1;
    this.isPaused = false;
    this.isGameOver = false;
    this.towers = [];
    this.enemies = [];
    this.bulletPool = [];
    this.missilePool = [];
    this.buildModeType = null;
  }

  public create(): void {
    const { width, height } = this.scale;

    // 1. Systems setup
    this.gridManager = new GridManager(this, this.mapData);
    this.juiceManager = new JuiceManager(this);

    // 2. Projectile Pools (Pre-allocate for performance)
    for (let i = 0; i < 40; i++) {
      const b = new Bullet(this);
      b.deactivate();
      this.bulletPool.push(b);
    }

    for (let i = 0; i < 20; i++) {
      const m = new Missile(this);
      m.deactivate();
      this.missilePool.push(m);
    }

    // 3. Wave Manager setup
    const waves = generateWaves(this.mapData.totalWaves);
    this.waveManager = new WaveManager(this, waves, this.mapData.waypoints);
    this.setupWaveCallbacks();

    // 4. UI Scene Launch
    this.scene.launch('UIScene', { gameScene: this });
    this.uiScene = this.scene.get('UIScene') as UIScene;

    // 5. Fit Map to Screen / Camera
    this.fitCameraToMap(width, height);

    // 6. Input Event Listeners
    this.setupInputHandlers();

    // Start subtle BGM synth
    SoundSynthesizer.getInstance().startBGM();

    // Initial HUD update
    this.time.delayedCall(100, () => {
      this.updateHUD();
    });
  }

  private fitCameraToMap(screenWidth: number, screenHeight: number): void {
    const mapPixelWidth = this.mapData.cols * this.mapData.tileSize;
    const mapPixelHeight = this.mapData.rows * this.mapData.tileSize;

    const zoomX = screenWidth / (mapPixelWidth + 60);
    const zoomY = screenHeight / (mapPixelHeight + 160);
    const zoom = Math.min(zoomX, zoomY, 1.2);

    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(mapPixelWidth / 2, mapPixelHeight / 2 - 20);
  }

  private setupWaveCallbacks(): void {
    this.waveManager.setCallbacks(
      // On spawn enemy
      (type: EnemyType) => {
        const enemy = new Enemy(this, type, this.mapData.waypoints, 1.0 + (this.waveManager.currentWaveNumber - 1) * 0.12);
        enemy.setCallbacks(
          (deadEnemy) => this.handleEnemyDeath(deadEnemy),
          (breachedEnemy) => this.handleEnemyBreach(breachedEnemy)
        );
        this.enemies.push(enemy);
      },
      // On wave complete
      (waveNumber: number, reward: number) => {
        this.addGold(reward);
        this.score += waveNumber * 100;
        this.uiScene.setWaveButtonState(false);
        this.updateHUD();
      },
      // On all waves complete (VICTORY!)
      () => {
        this.handleVictory();
      },
      // On wave start
      (waveNumber: number, isBoss: boolean) => {
        this.uiScene.setWaveButtonState(true);
        this.uiScene.showWaveBanner(waveNumber, isBoss);
      }
    );
  }

  private setupInputHandlers(): void {
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const coord = this.gridManager.pixelToGrid(worldPoint.x, worldPoint.y);

      if (coord.col !== this.hoverCol || coord.row !== this.hoverRow) {
        this.hoverCol = coord.col;
        this.hoverRow = coord.row;

        if (this.buildModeType) {
          const stats = TOWERS_CONFIG[this.buildModeType];
          this.gridManager.showPlacementPreview(coord.col, coord.row, stats.range);
        }
      }
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Ignore if clicking UI DOM overlay elements
      if ((pointer.event.target as HTMLElement).closest('.hud-overlay')) {
        return;
      }

      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const coord = this.gridManager.pixelToGrid(worldPoint.x, worldPoint.y);

      if (this.buildModeType) {
        // Build tower
        this.tryBuildTower(coord.col, coord.row, this.buildModeType);
      } else {
        // Inspect clicked tower
        const clickedTower = this.towers.find(t => t.gridCol === coord.col && t.gridRow === coord.row);
        if (clickedTower) {
          SoundSynthesizer.getInstance().playUiClick();
          this.gridManager.showTowerRange(clickedTower.x, clickedTower.y, clickedTower.currentRange);
          this.uiScene.openInspectCard(clickedTower);
        } else {
          this.uiScene.closeInspectCard();
        }
      }
    });
  }

  public setBuildMode(type: TowerType | null): void {
    this.buildModeType = type;
    if (!type) {
      this.gridManager.clearPreview();
    }
  }

  public tryBuildTower(col: number, row: number, type: TowerType): boolean {
    const stats = TOWERS_CONFIG[type];

    if (!this.gridManager.isBuildable(col, row)) {
      SoundSynthesizer.getInstance().playError();
      return false;
    }

    if (this.gold < stats.cost) {
      SoundSynthesizer.getInstance().playError();
      return false;
    }

    // Spend gold and construct tower
    this.spendGold(stats.cost);
    const center = this.gridManager.gridToPixelCenter(col, row);
    const tower = new Tower(this, center.x, center.y, col, row, type);
    this.towers.push(tower);
    this.gridManager.setOccupied(col, row, true);

    SoundSynthesizer.getInstance().playUpgrade();
    this.juiceManager.explode(center.x, center.y, 0x00f2ff, 10, 0.8);

    // Keep build mode on for quick multi-placement, but refresh preview
    this.gridManager.showPlacementPreview(col, row, stats.range);
    this.updateHUD();

    return true;
  }

  public removeTower(tower: Tower): void {
    this.gridManager.setOccupied(tower.gridCol, tower.gridRow, false);
    this.towers = this.towers.filter(t => t !== tower);
    tower.destroy();
    this.updateHUD();
  }

  public startNextWave(): void {
    if (this.waveManager.isWaveInProgress) {
      // Early call bonus!
      this.addGold(35);
      SoundSynthesizer.getInstance().playCoin();
      this.juiceManager.showFloatingGold(this.scale.width / 2, 100, 35);
    }
    this.waveManager.startNextWave();
    this.updateHUD();
  }

  private handleEnemyDeath(enemy: Enemy): void {
    this.enemies = this.enemies.filter(e => e !== enemy);
    this.addGold(enemy.stats.goldReward);
    this.score += enemy.stats.scoreReward;
    this.totalKills++;
    this.updateHUD();
  }

  private handleEnemyBreach(enemy: Enemy): void {
    this.enemies = this.enemies.filter(e => e !== enemy);
    this.lives = Math.max(0, this.lives - (enemy.stats.isBoss ? 5 : 1));
    this.juiceManager.shakeCamera(0.018, 250);
    SoundSynthesizer.getInstance().playError();
    this.updateHUD();

    if (this.lives <= 0 && !this.isGameOver) {
      this.handleGameOver();
    }
  }

  private handleVictory(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Calculate star rating based on remaining base lives
    let stars = 1;
    if (this.lives >= this.mapData.startLives) {
      stars = 3; // Flawless defense!
    } else if (this.lives >= this.mapData.startLives * 0.5) {
      stars = 2;
    }

    SaveManager.getInstance().recordVictory(this.levelId, stars, this.score, this.totalKills, this.gold);
    SoundSynthesizer.getInstance().playVictory();

    this.uiScene.showVictoryModal(this.score, this.totalKills, this.lives, this.mapData.startLives);
  }

  private handleGameOver(): void {
    this.isGameOver = true;
    SaveManager.getInstance().recordWave(this.levelId, this.waveManager.currentWaveNumber, this.score);
    SoundSynthesizer.getInstance().playGameOver();
    this.uiScene.showDefeatModal(this.score, this.totalKills, this.waveManager.currentWaveNumber);
  }

  public restartLevel(): void {
    this.scene.restart({ levelId: this.levelId });
  }

  public addGold(amount: number): void {
    this.gold += amount;
    this.updateHUD();
  }

  public spendGold(amount: number): void {
    this.gold = Math.max(0, this.gold - amount);
    this.updateHUD();
  }

  public setGameSpeed(speed: number): void {
    this.gameSpeed = speed;
    this.time.timeScale = this.isPaused ? 0 : speed;
  }

  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    this.time.timeScale = this.isPaused ? 0 : this.gameSpeed;
    return this.isPaused;
  }

  public updateHUD(): void {
    if (this.uiScene) {
      this.uiScene.updateStats(
        this.gold,
        this.lives,
        this.waveManager.currentWaveNumber,
        this.waveManager.totalWaves,
        this.score
      );
    }
  }

  public update(time: number, delta: number): void {
    if (this.isPaused || this.isGameOver) return;

    // 1. Update Wave Spawning
    this.waveManager.update(delta, this.enemies);

    // 2. Update Active Enemies
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.active && !e.isDead) {
        e.update(time, delta);
      }
    }

    // 3. Update Towers Firing & Target Acquisition
    for (let i = 0; i < this.towers.length; i++) {
      this.towers[i].updateTower(time, this.enemies, this.bulletPool, this.missilePool, this.juiceManager);
    }

    // 4. Update Projectiles
    for (let i = 0; i < this.bulletPool.length; i++) {
      const b = this.bulletPool[i];
      if (b.active) b.update(time, delta);
    }

    for (let i = 0; i < this.missilePool.length; i++) {
      const m = this.missilePool[i];
      if (m.active) m.update(time, delta);
    }
  }
}
