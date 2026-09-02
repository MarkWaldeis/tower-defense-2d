import Phaser from 'phaser';
import { EnemyStats, Point, EnemyType } from '../../types/game';
import { ENEMIES_CONFIG } from '../../config/GameConfig';
import { JuiceManager } from '../../systems/JuiceManager';
import { SoundSynthesizer } from '../../audio/SoundSynthesizer';

export class Enemy extends Phaser.GameObjects.Container {
  public enemyType: EnemyType;
  public stats: EnemyStats;
  public currentHp: number;
  public maxHp: number;
  public waypoints: Point[];
  public waypointIndex: number = 0;
  public isDead: boolean = false;
  public hasReachedBase: boolean = false;
  public totalDistanceTraveled: number = 0;

  // Debuffs
  private slowFactor: number = 1.0;
  private slowTimer: number = 0;

  // Visuals
  private bodySprite: Phaser.GameObjects.Sprite;
  private healthBarBg: Phaser.GameObjects.Graphics;
  private healthBarFill: Phaser.GameObjects.Graphics;
  private slowAura: Phaser.GameObjects.Arc;

  private onDeathCallback?: (enemy: Enemy) => void;
  private onReachBaseCallback?: (enemy: Enemy) => void;

  constructor(
    scene: Phaser.Scene,
    type: EnemyType,
    waypoints: Point[],
    hpMultiplier: number = 1.0
  ) {
    super(scene, waypoints[0].x, waypoints[0].y);

    this.enemyType = type;
    this.stats = { ...ENEMIES_CONFIG[type] };
    this.maxHp = Math.round(this.stats.hp * hpMultiplier);
    this.currentHp = this.maxHp;
    this.waypoints = waypoints;

    // 1. Slow aura indicator
    this.slowAura = scene.add.circle(0, 0, this.stats.size + 4, 0x00f2ff, 0.35);
    this.slowAura.setVisible(false);
    this.add(this.slowAura);

    // 2. Body Sprite
    this.bodySprite = scene.add.sprite(0, 0, `enemy_${type.toLowerCase()}`);
    this.add(this.bodySprite);

    // 3. Health bar graphics
    this.healthBarBg = scene.add.graphics();
    this.healthBarFill = scene.add.graphics();
    this.add(this.healthBarBg);
    this.add(this.healthBarFill);

    this.updateHealthBar();

    scene.add.existing(this);
    this.setDepth(5);
  }

  public setCallbacks(
    onDeath: (enemy: Enemy) => void,
    onReachBase: (enemy: Enemy) => void
  ) {
    this.onDeathCallback = onDeath;
    this.onReachBaseCallback = onReachBase;
  }

  public takeDamage(amount: number, isArmorPiercing: boolean = false, juice?: JuiceManager): void {
    if (this.isDead || this.hasReachedBase) return;

    // Armor calculation
    let effectiveDamage = amount;
    if (!isArmorPiercing && this.stats.armor > 0) {
      effectiveDamage = Math.max(1, amount - this.stats.armor);
    }

    this.currentHp -= effectiveDamage;

    // Floating text
    if (juice) {
      juice.showFloatingDamage(this.x, this.y, effectiveDamage, isArmorPiercing ? '#00f2ff' : '#ffffff');
    }

    // Hit flash
    this.bodySprite.setTint(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (this.active && !this.isDead) {
        this.bodySprite.clearTint();
      }
    });

    this.updateHealthBar();

    if (this.currentHp <= 0) {
      this.die(juice);
    }
  }

  public applySlow(factor: number = 0.5, durationSeconds: number = 3): void {
    this.slowFactor = factor;
    this.slowTimer = durationSeconds * 1000;
    this.slowAura.setVisible(true);
  }

  private updateHealthBar(): void {
    this.healthBarBg.clear();
    this.healthBarFill.clear();

    if (this.currentHp >= this.maxHp) {
      return; // Full HP, hide bar
    }

    const barWidth = Math.max(28, this.stats.size * 1.6);
    const barHeight = 4;
    const barY = -this.stats.size - 8;

    this.healthBarBg.fillStyle(0x000000, 0.7);
    this.healthBarBg.fillRoundedRect(-barWidth / 2, barY, barWidth, barHeight, 2);

    const hpPercent = Math.max(0, this.currentHp / this.maxHp);
    const fillColor = hpPercent > 0.5 ? 0x32d74b : hpPercent > 0.25 ? 0xff9f0a : 0xff453a;

    this.healthBarFill.fillStyle(fillColor, 1);
    this.healthBarFill.fillRoundedRect(-barWidth / 2, barY, barWidth * hpPercent, barHeight, 2);
  }

  public update(_time: number, delta: number): void {
    if (this.isDead || this.hasReachedBase) return;

    // Handle Slow timer
    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
      if (this.slowTimer <= 0) {
        this.slowFactor = 1.0;
        this.slowAura.setVisible(false);
      }
    }

    // Waypoint movement
    if (this.waypointIndex < this.waypoints.length) {
      const target = this.waypoints[this.waypointIndex];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);

      // Rotate towards movement direction
      const angle = Math.atan2(dy, dx);
      this.bodySprite.setRotation(angle);

      const speed = this.stats.speed * this.slowFactor;
      const step = (speed * delta) / 1000;

      if (dist <= step) {
        this.x = target.x;
        this.y = target.y;
        this.totalDistanceTraveled += dist;
        this.waypointIndex++;

        if (this.waypointIndex >= this.waypoints.length) {
          this.reachBase();
        }
      } else {
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        this.totalDistanceTraveled += step;
      }
    }
  }

  private reachBase(): void {
    if (this.hasReachedBase || this.isDead) return;
    this.hasReachedBase = true;
    if (this.onReachBaseCallback) {
      this.onReachBaseCallback(this);
    }
    this.destroy();
  }

  private die(juice?: JuiceManager): void {
    if (this.isDead) return;
    this.isDead = true;

    SoundSynthesizer.getInstance().playExplosion(this.stats.isBoss);

    if (juice) {
      juice.explode(this.x, this.y, this.stats.color, this.stats.isBoss ? 35 : 12, this.stats.isBoss ? 2 : 1);
      juice.showFloatingGold(this.x, this.y, this.stats.goldReward);
      if (this.stats.isBoss) {
        juice.shakeCamera(0.02, 300);
        juice.hitStop(80);
      }
    }

    if (this.onDeathCallback) {
      this.onDeathCallback(this);
    }

    this.destroy();
  }
}
