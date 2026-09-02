import Phaser from 'phaser';
import { TowerType, TargetingMode, TowerStats } from '../../types/game';
import { TOWERS_CONFIG } from '../../config/GameConfig';
import { Enemy } from '../enemies/Enemy';
import { FantasyProjectile } from '../projectiles/ProjectilePool';
import { JuiceManager } from '../../systems/JuiceManager';
import { SoundSynthesizer } from '../../audio/SoundSynthesizer';

export class Tower extends Phaser.GameObjects.Container {
  public towerType: TowerType;
  public level: number = 1;
  public targetingMode: TargetingMode = 'FIRST';
  public spotIndex: number;
  public baseStats: TowerStats;
  public totalInvestedGold: number;

  public currentDamage: number;
  public currentRange: number;
  public currentFireRate: number;

  private lastFiredTime: number = 0;
  private currentTarget: Enemy | null = null;

  private towerSprite: Phaser.GameObjects.Sprite;
  private levelBadge: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    spotIndex: number,
    type: TowerType
  ) {
    super(scene, x, y);

    this.spotIndex = spotIndex;
    this.towerType = type;
    this.baseStats = TOWERS_CONFIG[type];
    this.totalInvestedGold = this.baseStats.cost;

    this.currentDamage = this.baseStats.damage;
    this.currentRange = this.baseStats.range;
    this.currentFireRate = this.baseStats.fireRate;

    // Sprite
    this.towerSprite = scene.add.sprite(0, 0, `tower_${type.toLowerCase()}`);
    this.add(this.towerSprite);

    // Level stars badge
    this.levelBadge = scene.add.text(14, -22, '★', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      color: '#facc15',
      stroke: '#451a03',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.levelBadge.setVisible(false);
    this.add(this.levelBadge);

    scene.add.existing(this);
    this.setDepth(11);
    this.updateStats();

    // Spawn bounce animation
    this.setScale(0.3);
    scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 220,
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

    this.levelBadge.setVisible(true);
    this.levelBadge.setText(this.level === 2 ? '★★' : '★★★');
    this.levelBadge.setColor(this.level === 3 ? '#f59e0b' : '#facc15');

    SoundSynthesizer.getInstance().playUpgrade();

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 1.15,
      yoyo: true,
      duration: 140
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
    projectilePool: FantasyProjectile[],
    juice: JuiceManager
  ): void {
    this.currentTarget = this.findBestTarget(enemies);
    if (!this.currentTarget) return;

    const fireInterval = 1000 / this.currentFireRate;
    if (time - this.lastFiredTime >= fireInterval) {
      this.fire(this.currentTarget, enemies, projectilePool, juice);
      this.lastFiredTime = time;
    }
  }

  private fire(
    target: Enemy,
    allEnemies: Enemy[],
    projectilePool: FantasyProjectile[],
    juice: JuiceManager
  ): void {
    SoundSynthesizer.getInstance().playShoot(this.towerType);

    // Recoil squash animation
    this.scene.tweens.add({
      targets: this.towerSprite,
      scaleY: 0.9,
      duration: 60,
      yoyo: true
    });

    const projectile = projectilePool.find(p => !p.active);
    if (!projectile) return;

    switch (this.towerType) {
      case 'SLINGER':
        projectile.fire('projectile_slinger', this.x, this.y - 12, target, this.currentDamage, 550, 0, false, undefined, juice);
        break;
      case 'CROSSBOW':
        projectile.fire('projectile_crossbow', this.x, this.y - 10, target, this.currentDamage, 750, 0, false, undefined, juice);
        break;
      case 'MAGE':
        projectile.fire('projectile_mage', this.x, this.y - 16, target, this.currentDamage, 480, 0, true, undefined, juice);
        break;
      case 'MORTAR':
        projectile.fire('projectile_mortar', this.x, this.y - 14, target, this.currentDamage, 320, 85 + this.level * 10, false, allEnemies, juice);
        break;
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
}
