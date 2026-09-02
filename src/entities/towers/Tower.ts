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
  private auraRing: Phaser.GameObjects.Graphics;

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

    // Aura ring for upgraded tiers
    this.auraRing = scene.add.graphics();
    this.add(this.auraRing);

    // Level stars badge
    this.levelBadge = scene.add.text(16, -26, '★', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
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
    const tier = this.baseStats.tiers[this.level - 1];
    return tier ? tier.upgradeCost : 0;
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

    // Visual Tier Upgrade Aura
    this.auraRing.clear();
    if (this.level === 2) {
      this.auraRing.lineStyle(2, 0x38bdf8, 0.7);
      this.auraRing.strokeCircle(0, 8, 28);
    } else if (this.level === 3) {
      this.auraRing.lineStyle(3, 0xf59e0b, 0.9);
      this.auraRing.strokeCircle(0, 8, 30);
      this.auraRing.fillStyle(0xf59e0b, 0.15);
      this.auraRing.fillCircle(0, 8, 30);
    }

    SoundSynthesizer.getInstance().playUpgrade();

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.25,
      scaleY: 1.25,
      yoyo: true,
      duration: 160,
      ease: 'Sine.easeInOut'
    });

    return true;
  }

  private updateStats(): void {
    const tier = this.baseStats.tiers[this.level - 1];
    if (tier) {
      this.currentDamage = tier.damage;
      this.currentRange = tier.range;
      this.currentFireRate = tier.fireRate;
    }
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
      scaleY: 0.88,
      duration: 50,
      yoyo: true
    });

    const projectile = projectilePool.find(p => !p.active);
    if (!projectile) return;

    switch (this.towerType) {
      case 'SLINGER':
        // Tier 3: Critical chance
        const isCrit = this.level === 3 && Math.random() < 0.35;
        const slingerDmg = isCrit ? this.currentDamage * 2.5 : this.currentDamage;
        projectile.fire('projectile_slinger', this.x, this.y - 12, target, slingerDmg, 580, 0, false, undefined, juice);
        if (isCrit) {
          juice.showFloatingText(this.x, this.y - 20, 'KRITISCH! 💥', '#ef4444');
        }
        break;
      case 'CROSSBOW':
        projectile.fire('projectile_crossbow', this.x, this.y - 10, target, this.currentDamage, 780, 0, false, undefined, juice);
        break;
      case 'MAGE':
        projectile.fire('projectile_mage', this.x, this.y - 16, target, this.currentDamage, 500, 0, true, undefined, juice);
        break;
      case 'MORTAR':
        const splashRadius = 80 + this.level * 20;
        projectile.fire('projectile_mortar', this.x, this.y - 14, target, this.currentDamage, 340, splashRadius, false, allEnemies, juice);
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
