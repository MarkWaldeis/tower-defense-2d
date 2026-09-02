import Phaser from 'phaser';
import { TowerType, TargetingMode, TowerStats } from '../../types/game';
import { TOWERS_CONFIG } from '../../config/GameConfig';
import { Enemy } from '../enemies/Enemy';
import { Bullet, Missile, BeamRenderer } from '../projectiles/ProjectilePool';
import { JuiceManager } from '../../systems/JuiceManager';
import { SoundSynthesizer } from '../../audio/SoundSynthesizer';

export class Tower extends Phaser.GameObjects.Container {
  public towerType: TowerType;
  public level: number = 1;
  public targetingMode: TargetingMode = 'FIRST';
  public gridCol: number;
  public gridRow: number;
  public baseStats: TowerStats;
  public totalInvestedGold: number;

  // Cached calculated stats
  public currentDamage: number;
  public currentRange: number;
  public currentFireRate: number;

  // Firing logic
  private lastFiredTime: number = 0;
  private currentTarget: Enemy | null = null;

  // Visuals
  private baseSprite: Phaser.GameObjects.Sprite;
  private turretSprite: Phaser.GameObjects.Sprite;
  private levelBadge: Phaser.GameObjects.Text;
  private beamRenderer: BeamRenderer;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    col: number,
    row: number,
    type: TowerType
  ) {
    super(scene, x, y);

    this.gridCol = col;
    this.gridRow = row;
    this.towerType = type;
    this.baseStats = TOWERS_CONFIG[type];
    this.totalInvestedGold = this.baseStats.cost;

    this.currentDamage = this.baseStats.damage;
    this.currentRange = this.baseStats.range;
    this.currentFireRate = this.baseStats.fireRate;

    // 1. Tower Base Platform
    this.baseSprite = scene.add.sprite(0, 0, 'tower_base');
    this.add(this.baseSprite);

    // 2. Turret Head / Weapon Barrels
    this.turretSprite = scene.add.sprite(0, 0, `turret_${type.toLowerCase()}`);
    this.add(this.turretSprite);

    // 3. Level indicator badge
    this.levelBadge = scene.add.text(12, -14, '★', {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '11px',
      color: '#00f2ff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.levelBadge.setVisible(false);
    this.add(this.levelBadge);

    this.beamRenderer = new BeamRenderer(scene);

    scene.add.existing(this);
    this.setDepth(6);
    this.updateStats();

    // Pulse spawn animation
    this.setScale(0.2);
    scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 250,
      ease: 'Back.out'
    });
  }

  public getUpgradeCost(): number {
    return Math.round(this.baseStats.cost * Math.pow(this.baseStats.upgradeCostMult, this.level));
  }

  public getSellValue(): number {
    return Math.round(this.totalInvestedGold * 0.65);
  }

  public upgrade(): boolean {
    if (this.level >= 3) return false;

    const cost = this.getUpgradeCost();
    this.totalInvestedGold += cost;
    this.level++;
    this.updateStats();

    // Visual feedback
    this.levelBadge.setVisible(true);
    this.levelBadge.setText(this.level === 2 ? '★★' : '★★★');
    this.levelBadge.setColor(this.level === 3 ? '#ffd60a' : '#00f2ff');

    SoundSynthesizer.getInstance().playUpgrade();

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 1.15,
      yoyo: true,
      duration: 150
    });

    return true;
  }

  private updateStats(): void {
    const lvlMultiplier = Math.pow(this.baseStats.damageMultPerLevel, this.level - 1);
    const rangeMultiplier = Math.pow(this.baseStats.rangeMultPerLevel, this.level - 1);

    this.currentDamage = Math.round(this.baseStats.damage * lvlMultiplier);
    this.currentRange = Math.round(this.baseStats.range * rangeMultiplier);
    this.currentFireRate = this.baseStats.fireRate * (1 + (this.level - 1) * 0.15);
  }

  public updateTower(
    time: number,
    enemies: Enemy[],
    bulletPool: Bullet[],
    missilePool: Missile[],
    juice: JuiceManager
  ): void {
    // 1. Acquire Target based on TargetingMode
    this.currentTarget = this.findBestTarget(enemies);

    if (!this.currentTarget) {
      this.beamRenderer.clear();
      return;
    }

    // 2. Rotate Turret towards target
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
    this.turretSprite.setRotation(angle);

    // 3. Weapon Attack Logic
    const fireInterval = 1000 / this.currentFireRate;
    if (time - this.lastFiredTime >= fireInterval) {
      this.fireWeapon(this.currentTarget, enemies, bulletPool, missilePool, juice);
      this.lastFiredTime = time;
    }

    // Laser continuous visual updates
    if (this.towerType === 'LASER' && this.currentTarget.active && !this.currentTarget.isDead) {
      this.beamRenderer.renderLaser(this.x, this.y, this.currentTarget.x, this.currentTarget.y, 2 + this.level);
    }
  }

  private fireWeapon(
    target: Enemy,
    allEnemies: Enemy[],
    bulletPool: Bullet[],
    missilePool: Missile[],
    juice: JuiceManager
  ): void {
    SoundSynthesizer.getInstance().playShoot(this.towerType);

    switch (this.towerType) {
      case 'GATLING': {
        const bullet = bulletPool.find(b => !b.active);
        if (bullet) {
          bullet.fire(this.x, this.y, target, this.currentDamage, false, juice);
        }
        break;
      }

      case 'LASER': {
        // Direct continuous tick
        target.takeDamage(this.currentDamage, true, juice);
        break;
      }

      case 'ROCKET': {
        const missile = missilePool.find(m => !m.active);
        if (missile) {
          missile.launch(this.x, this.y, target, this.currentDamage, 80 + this.level * 10, allEnemies, juice);
        }
        break;
      }

      case 'CRYO': {
        // Frost pulse AoE around tower
        const ring = this.scene.add.circle(this.x, this.y, 10, 0x00f2ff, 0.4).setDepth(10);
        this.scene.tweens.add({
          targets: ring,
          radius: this.currentRange,
          alpha: 0,
          duration: 350,
          ease: 'Cubic.out',
          onComplete: () => ring.destroy()
        });

        allEnemies.forEach(e => {
          if (e.active && !e.isDead && Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y) <= this.currentRange) {
            e.takeDamage(this.currentDamage, false, juice);
            e.applySlow(0.45, 3.2);
          }
        });
        break;
      }

      case 'TESLA': {
        // Chain lightning to up to 4 targets
        const targets: Enemy[] = [target];
        const candidates = allEnemies.filter(
          e => e !== target && e.active && !e.isDead && Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y) <= this.currentRange
        );

        let currentAnchor = target;
        while (targets.length < 4 && candidates.length > 0) {
          candidates.sort((a, b) => {
            const da = Phaser.Math.Distance.Between(currentAnchor.x, currentAnchor.y, a.x, a.y);
            const db = Phaser.Math.Distance.Between(currentAnchor.x, currentAnchor.y, b.x, b.y);
            return da - db;
          });
          const next = candidates.shift()!;
          targets.push(next);
          currentAnchor = next;
        }

        const points = [{ x: this.x, y: this.y }, ...targets.map(t => ({ x: t.x, y: t.y }))];
        this.beamRenderer.renderLightning(points);
        this.scene.time.delayedCall(120, () => this.beamRenderer.clear());

        targets.forEach((t, idx) => {
          const falloff = 1 - idx * 0.15;
          t.takeDamage(this.currentDamage * falloff, true, juice);
        });
        break;
      }
    }
  }

  private findBestTarget(enemies: Enemy[]): Enemy | null {
    const inRange = enemies.filter(
      e => e.active && !e.isDead && Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y) <= this.currentRange
    );

    if (inRange.length === 0) return null;

    switch (this.targetingMode) {
      case 'FIRST':
        return inRange.reduce((prev, curr) => (curr.totalDistanceTraveled > prev.totalDistanceTraveled ? curr : prev));
      case 'LAST':
        return inRange.reduce((prev, curr) => (curr.totalDistanceTraveled < prev.totalDistanceTraveled ? curr : prev));
      case 'STRONGEST':
        return inRange.reduce((prev, curr) => (curr.currentHp > prev.currentHp ? curr : prev));
      case 'WEAKEST':
        return inRange.reduce((prev, curr) => (curr.currentHp < prev.currentHp ? curr : prev));
      case 'CLOSEST':
        return inRange.reduce((prev, curr) => {
          const dCurr = Phaser.Math.Distance.Between(this.x, this.y, curr.x, curr.y);
          const dPrev = Phaser.Math.Distance.Between(this.x, this.y, prev.x, prev.y);
          return dCurr < dPrev ? curr : prev;
        });
      default:
        return inRange[0];
    }
  }

  public destroy(fromScene?: boolean): void {
    this.beamRenderer.clear();
    super.destroy(fromScene);
  }
}
