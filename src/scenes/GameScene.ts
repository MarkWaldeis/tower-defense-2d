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

    // 1. Render Kingdom Rush Frontiers Hand-Drawn Desert Map
    this.renderDesertMap(width, height);

    // 2. Systems setup
    this.juiceManager = new JuiceManager(this);
    this.rangeGraphics = this.add.graphics().setDepth(15);

    // 3. Projectile Pool
    for (let i = 0; i < 40; i++) {
      const p = new FantasyProjectile(this);
      p.deactivate();
      this.projectilePool.push(p);
    }

    // 4. Render Build Spot Foundations
    this.renderBuildSpots();

    // 5. Wave Manager setup
    const waves = generateWaves(this.mapData.totalWaves);
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

  private renderDesertMap(width: number, height: number): void {
    const g = this.add.graphics().setDepth(1);

    // 1. Canyon Sandstone Background
    g.fillGradientStyle(0xdfba81, 0xdfba81, 0xcda063, 0xcda063, 1);
    g.fillRect(0, 0, width, height);

    // 2. Canyon Cliffs (Top & Bottom rock borders)
    g.fillStyle(0x926639, 1);
    // North Canyon Wall
    g.fillRect(0, 0, width, 110);
    g.lineStyle(3, 0x543618, 1);
    g.strokeRect(0, 0, width, 110);

    // South Canyon Wall
    g.fillStyle(0x82542a, 1);
    g.fillRect(0, height - 70, width, 70);
    g.strokeRect(0, height - 70, width, 70);

    // 3. Ancient Sandstone Temple 1 (Upper Left)
    this.drawAncientTemple(g, 180, 50, 'TEMPEL DER SONNE');

    // 4. Ancient Sandstone Temple 2 (Upper Right)
    this.drawAncientTemple(g, 810, 50, 'RUINEN VON RA');

    // 5. Central Oasis (Water pool + Palms + Cacti)
    g.fillStyle(0x38bdf8, 1);
    g.fillEllipse(540, 340, 95, 55);
    g.lineStyle(3, 0x0284c7, 1);
    g.strokeEllipse(540, 340, 95, 55);
    // Water reflection ring
    g.fillStyle(0xe0f2fe, 0.4);
    g.fillEllipse(530, 335, 50, 24);

    this.drawPalm(475, 310);
    this.drawPalm(610, 320);
    this.drawPalm(580, 375);
    this.drawCactus(460, 360);
    this.drawCactus(630, 360);

    // 6. Terracotta Desert Houses in lower canyon
    this.drawDesertHouse(g, 260, 500);
    this.drawDesertHouse(g, 780, 480);

    // 7. Winding Sandy Road (Wide dirt track with stones & tracks)
    const pts = this.mapData.waypoints;
    g.lineStyle(42, 0xc29358, 1);
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      g.lineTo(pts[i].x, pts[i].y);
    }
    g.strokePath();

    // Road Outline
    g.lineStyle(3, 0x7c532b, 0.75);
    g.strokePath();

    // Road Inner Sand Glow
    g.lineStyle(24, 0xdfba81, 0.85);
    g.strokePath();

    // Spawn Mountain Cave (Left Portal)
    g.fillStyle(0x3e2714, 1);
    g.fillRoundedRect(10, 175, 50, 90, 8);
    g.lineStyle(4, 0x78350f, 1);
    g.strokeRoundedRect(10, 175, 50, 90, 8);
    this.add.text(35, 220, '👹 SPAWN', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      fontStyle: '900',
      color: '#fde047'
    }).setOrigin(0.5).setDepth(2);

    // Fortress Base Exit (Right Portal)
    g.fillStyle(0x1e293b, 1);
    g.fillRoundedRect(width - 60, 165, 50, 90, 8);
    g.lineStyle(4, 0x3b82f6, 1);
    g.strokeRoundedRect(width - 60, 165, 50, 90, 8);
    this.add.text(width - 35, 210, '🏰 BASIS', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      fontStyle: '900',
      color: '#38bdf8'
    }).setOrigin(0.5).setDepth(2);
  }

  private drawAncientTemple(g: Phaser.GameObjects.Graphics, x: number, y: number, label: string): void {
    // Temple Roof / Pediment
    g.fillStyle(0xdfba81, 1);
    g.fillTriangle(x, y - 18, x - 55, y + 10, x + 55, y + 10);
    g.lineStyle(2, 0x78350f, 1);
    g.strokeTriangle(x, y - 18, x - 55, y + 10, x + 55, y + 10);

    // Pillars
    g.fillStyle(0xfef3c7, 1);
    for (let px = x - 42; px <= x + 42; px += 28) {
      g.fillRect(px - 5, y + 10, 10, 32);
      g.strokeRect(px - 5, y + 10, 10, 32);
    }

    // Temple Base Step
    g.fillRect(x - 60, y + 42, 120, 12);
    g.strokeRect(x - 60, y + 42, 120, 12);

    this.add.text(x, y + 26, label, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#78350f'
    }).setOrigin(0.5).setDepth(2);
  }

  private drawPalm(x: number, y: number): void {
    const g = this.add.graphics().setDepth(2);
    g.lineStyle(4, 0x78350f, 1);
    g.beginPath();
    g.moveTo(x, y + 20);
    g.lineTo(x, y);
    g.strokePath();

    g.fillStyle(0x16a34a, 1);
    g.fillCircle(x - 10, y - 4, 9);
    g.fillCircle(x + 10, y - 4, 9);
    g.fillCircle(x, y - 10, 10);
  }

  private drawCactus(x: number, y: number): void {
    const g = this.add.graphics().setDepth(2);
    g.fillStyle(0x15803d, 1);
    g.fillRoundedRect(x - 3, y - 14, 6, 20, 2);
    g.fillRoundedRect(x - 9, y - 10, 6, 4, 2);
    g.fillRoundedRect(x - 9, y - 14, 4, 8, 2);
    g.fillRoundedRect(x + 3, y - 6, 6, 4, 2);
    g.fillRoundedRect(x + 5, y - 10, 4, 8, 2);
  }

  private drawDesertHouse(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    g.fillStyle(0xfef08a, 1);
    g.fillRoundedRect(x - 22, y - 16, 44, 32, 4);
    g.lineStyle(2, 0x92400e, 1);
    g.strokeRoundedRect(x - 22, y - 16, 44, 32, 4);
    // Wooden Door & Window
    g.fillStyle(0x78350f, 1);
    g.fillRect(x - 6, y, 12, 16);
    g.fillStyle(0x38bdf8, 1);
    g.fillRect(x - 16, y - 8, 7, 7);
  }

  private renderBuildSpots(): void {
    this.buildSpots.forEach((spot, index) => {
      const sprite = this.add.sprite(spot.x, spot.y, 'build_spot_empty')
        .setInteractive({ useHandCursor: true })
        .setDepth(3);

      sprite.on('pointerover', () => {
        if (!spot.occupied) {
          sprite.setScale(1.1);
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
        const enemy = new Enemy(this, type, this.mapData.waypoints, 1.0 + (this.waveManager.currentWaveNumber - 1) * 0.1);
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
      // If clicking outside HUD and spell is active
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
      // Open Radial / Drawer Build Menu for this spot
      this.selectedSpotIndex = spotIndex;
      this.selectedTower = null;
      this.uiScene.openBuildMenuForSpot(spotIndex, spot.x, spot.y);
      this.showRange(spot.x, spot.y, TOWERS_CONFIG.SLINGER.range);
    } else {
      // Find existing tower on this spot
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

    // Find all enemies within 120px radius of click
    const hitEnemies = this.enemies.filter(
      e => e.active && !e.isDead && Phaser.Math.Distance.Between(x, y, e.x, e.y) <= 130
    );

    const chainPoints = hitEnemies.map(e => ({ x: e.x, y: e.y }));
    this.juiceManager.drawLightningStrike(x, 0, x, y, chainPoints);
    this.juiceManager.shakeCamera(0.015, 200);

    hitEnemies.forEach(e => {
      e.takeDamage(120, true, this.juiceManager);
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
