import Phaser from 'phaser';
import { MAPS, TOWERS_CONFIG, generateWaves } from '../config/GameConfig';
import { MapData, TowerType, EnemyType, BuildSpot } from '../types/game';
import { WaveManager } from '../systems/WaveManager';
import { JuiceManager } from '../systems/JuiceManager';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import { SaveManager } from '../systems/SaveManager';
import { Tower } from '../entities/towers/Tower';
import { Enemy } from '../entities/enemies/Enemy';
import { FantasyProjectile } from '../entities/projectiles/ProjectilePool';
import { UIScene } from './UIScene';

export class GameScene extends Phaser.Scene {
  public levelId: number = 1;
  public mapData!: MapData;

  // Systems
  public waveManager!: WaveManager;
  public juiceManager!: JuiceManager;
  private uiScene!: UIScene;

  // Economy & State
  public gold: number = 320;
  public lives: number = 20;
  public score: number = 0;
  public totalKills: number = 0;
  public gameSpeed: number = 1;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;

  // Entities
  public buildSpots: BuildSpot[] = [];
  public buildSpotObjects: Phaser.GameObjects.Sprite[] = [];
  public towers: Tower[] = [];
  public enemies: Enemy[] = [];
  public projectilePool: FantasyProjectile[] = [];

  // Spell Active State
  public activeSpell: 'LIGHTNING' | 'METEOR' | null = null;
  public selectedSpotIndex: number | null = null;
  public selectedTower: Tower | null = null;

  // Range Circle
  private rangeGraphics!: Phaser.GameObjects.Graphics;

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
    this.projectilePool = [];
    this.buildSpots = this.mapData.buildSpots.map((p, i) => ({
      id: i,
      x: p.x,
      y: p.y,
      occupied: false
    }));
  }

  public create(): void {
    const { width, height } = this.scale;

    // 1. Render AAA Hand-Drawn Map Background dynamically for selected level
    const bgKey = this.mapData.bgTextureKey || 'map_desert_ruins';
    if (this.textures.exists(bgKey)) {
      const bg = this.add.image(width / 2, height / 2, bgKey);
      bg.setDisplaySize(width, height);
      bg.setDepth(0);
    } else {
      const g = this.add.graphics().setDepth(0);
      g.fillGradientStyle(0xdfba81, 0xdfba81, 0xcda063, 0xcda063, 1);
      g.fillRect(0, 0, width, height);
    }

    // 2. Systems setup
    this.juiceManager = new JuiceManager(this);
    this.rangeGraphics = this.add.graphics().setDepth(15);

    // 3. Projectile Pool
    for (let i = 0; i < 40; i++) {
      const p = new FantasyProjectile(this);
      p.deactivate();
      this.projectilePool.push(p);
    }

    // 4. Render Build Spot Foundations with Enlarged Touch Area
    this.renderBuildSpots();

    // 5. Wave Manager setup for this specific level
    const waves = generateWaves(this.mapData.totalWaves, this.levelId);
    this.waveManager = new WaveManager(this, waves, this.mapData.waypoints);
    this.setupWaveCallbacks();

    // 6. Launch UI Scene
    this.scene.launch('UIScene', { gameScene: this });
    this.uiScene = this.scene.get('UIScene') as UIScene;

    // 7. Inputs
    this.setupInputHandlers();

    // Sound BGM
    SoundSynthesizer.getInstance().startBGM();

    this.time.delayedCall(100, () => {
      this.updateHUD();
    });
  }

  private renderBuildSpots(): void {
    this.buildSpots.forEach((spot, index) => {
      const sprite = this.add.sprite(spot.x, spot.y, 'build_spot_empty')
        .setDepth(3);

      // Generous 44px radius touch hit-target for effortless mobile finger taps
      sprite.setInteractive(
        new Phaser.Geom.Circle(30, 30, 44),
        Phaser.Geom.Circle.Contains
      );

      sprite.on('pointerover', () => {
        if (!spot.occupied) {
          sprite.setScale(1.15);
        }
      });

      sprite.on('pointerout', () => {
        sprite.setScale(1.0);
      });

      sprite.on('pointerdown', () => {
        SoundSynthesizer.getInstance().playUiClick();
        this.handleSpotClick(index);
      });

      this.buildSpotObjects.push(sprite);
    });
  }

  private setupWaveCallbacks(): void {
    this.waveManager.setCallbacks(
      (type: EnemyType) => {
        const enemy = new Enemy(this, type, this.mapData.waypoints, 1.0 + (this.waveManager.currentWaveNumber - 1) * 0.12);
        enemy.setCallbacks(
          (deadEnemy) => this.handleEnemyDeath(deadEnemy),
          (breachedEnemy) => this.handleEnemyBreach(breachedEnemy)
        );
        this.enemies.push(enemy);
      },
      (waveNumber: number, reward: number) => {
        this.addGold(reward);
        this.score += waveNumber * 120;
        this.uiScene.setWaveButtonState(false);
        this.updateHUD();
      },
      () => {
        this.handleVictory();
      },
      (waveNumber: number, isBoss: boolean) => {
        this.uiScene.setWaveButtonState(true);
        this.uiScene.showWaveBanner(waveNumber, isBoss);
      }
    );
  }

  private setupInputHandlers(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.activeSpell) {
        if (this.activeSpell === 'LIGHTNING') {
          this.castLightningSpell(pointer.x, pointer.y);
        }
        this.activeSpell = null;
        this.uiScene.clearSpellSelection();
        return;
      }
    });
  }

  public handleSpotClick(spotIndex: number): void {
    const spot = this.buildSpots[spotIndex];
    if (!spot) return;

    if (!spot.occupied) {
      this.selectedSpotIndex = spotIndex;
      this.selectedTower = null;
      this.uiScene.openBuildMenuForSpot(spotIndex, spot.x, spot.y);
      this.showRange(spot.x, spot.y, TOWERS_CONFIG.SLINGER.range);
    } else {
      const tower = this.towers.find(t => t.spotIndex === spotIndex);
      if (tower) {
        this.selectedTower = tower;
        this.selectedSpotIndex = null;
        this.uiScene.openInspectCard(tower);
        this.showRange(tower.x, tower.y, tower.currentRange);
      }
    }
  }

  public buildTowerOnSpot(spotIndex: number, type: TowerType): boolean {
    const spot = this.buildSpots[spotIndex];
    const stats = TOWERS_CONFIG[type];

    if (!spot || spot.occupied) return false;
    if (this.gold < stats.cost) {
      SoundSynthesizer.getInstance().playError();
      return false;
    }

    this.spendGold(stats.cost);
    spot.occupied = true;
    this.buildSpotObjects[spotIndex].setVisible(false);

    const tower = new Tower(this, spot.x, spot.y, spotIndex, type);
    tower.setSize(64, 64);
    // Hit area centered in the 64x64 container — large enough for finger taps
    tower.setInteractive(
      new Phaser.Geom.Circle(32, 32, 48),
      Phaser.Geom.Circle.Contains
    );
    tower.on('pointerdown', () => {
      SoundSynthesizer.getInstance().playUiClick();
      this.handleSpotClick(spotIndex);
    });

    this.towers.push(tower);

    SoundSynthesizer.getInstance().playUpgrade();
    this.juiceManager.explode(spot.x, spot.y, 0xf59e0b, 15, 1);
    this.clearRange();
    this.updateHUD();

    return true;
  }

  public removeTower(tower: Tower): void {
    const spot = this.buildSpots[tower.spotIndex];
    if (spot) {
      spot.occupied = false;
      this.buildSpotObjects[tower.spotIndex].setVisible(true);
    }
    this.towers = this.towers.filter(t => t !== tower);
    tower.destroy();
    this.clearRange();
    this.updateHUD();
  }

  public castLightningSpell(x: number, y: number): void {
    SoundSynthesizer.getInstance().playLightningStrike();

    const hitEnemies = this.enemies.filter(
      e => e.active && !e.isDead && Phaser.Math.Distance.Between(x, y, e.x, e.y) <= 140
    );

    const chainPoints = hitEnemies.map(e => ({ x: e.x, y: e.y }));
    this.juiceManager.drawLightningStrike(x, 0, x, y, chainPoints);
    this.juiceManager.shakeCamera(0.015, 200);

    hitEnemies.forEach(e => {
      e.takeDamage(130, true, this.juiceManager);
    });
  }

  public showRange(x: number, y: number, range: number): void {
    this.rangeGraphics.clear();
    this.rangeGraphics.fillStyle(0x38bdf8, 0.12);
    this.rangeGraphics.fillCircle(x, y, range);
    this.rangeGraphics.lineStyle(2, 0x0284c7, 0.8);
    this.rangeGraphics.strokeCircle(x, y, range);
  }

  public clearRange(): void {
    this.rangeGraphics.clear();
  }

  public startNextWave(): void {
    if (this.waveManager.isWaveInProgress) {
      this.addGold(30);
      SoundSynthesizer.getInstance().playCoin();
      this.juiceManager.showFloatingGold(this.scale.width / 2, 80, 30);
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

    let stars = 1;
    if (this.lives >= this.mapData.startLives) {
      stars = 3;
    } else if (this.lives >= this.mapData.startLives * 0.5) {
      stars = 2;
    }

    // Record victory and unlock next level!
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

    this.waveManager.update(delta, this.enemies);

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.active && !e.isDead) {
        e.update(time, delta);
      }
    }

    for (let i = 0; i < this.towers.length; i++) {
      this.towers[i].updateTower(time, this.enemies, this.projectilePool, this.juiceManager);
    }

    for (let i = 0; i < this.projectilePool.length; i++) {
      const p = this.projectilePool[i];
      if (p.active) p.update(time, delta);
    }
  }
}
