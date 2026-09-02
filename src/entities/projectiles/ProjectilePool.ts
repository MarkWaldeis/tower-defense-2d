import Phaser from 'phaser';
import { Enemy } from '../enemies/Enemy';
import { JuiceManager } from '../../systems/JuiceManager';

export class Bullet extends Phaser.GameObjects.Sprite {
  public speed: number = 600;
  public damage: number = 10;
  public isArmorPiercing: boolean = false;
  private targetEnemy: Enemy | null = null;
  private targetX: number = 0;
  private targetY: number = 0;
  private juice?: JuiceManager;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'bullet_gatling');
    scene.add.existing(this);
    this.setDepth(8);
  }

  public fire(
    startX: number,
    startY: number,
    target: Enemy,
    damage: number,
    isArmorPiercing: boolean = false,
    juice?: JuiceManager
  ): void {
    this.setPosition(startX, startY);
    this.targetEnemy = target;
    this.targetX = target.x;
    this.targetY = target.y;
    this.damage = damage;
    this.isArmorPiercing = isArmorPiercing;
    this.juice = juice;
    this.setActive(true);
    this.setVisible(true);

    const angle = Phaser.Math.Angle.Between(startX, startY, target.x, target.y);
    this.setRotation(angle);
  }

  public update(_time: number, delta: number): void {
    if (!this.active) return;

    // Follow moving target if still alive, else continue to last known point
    if (this.targetEnemy && this.targetEnemy.active && !this.targetEnemy.isDead) {
      this.targetX = this.targetEnemy.x;
      this.targetY = this.targetEnemy.y;
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);
    const step = (this.speed * delta) / 1000;

    if (dist <= step || dist < 12) {
      this.hitTarget();
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
      this.setRotation(Math.atan2(dy, dx));
    }
  }

  private hitTarget(): void {
    if (this.targetEnemy && this.targetEnemy.active && !this.targetEnemy.isDead) {
      this.targetEnemy.takeDamage(this.damage, this.isArmorPiercing, this.juice);
    }
    this.deactivate();
  }

  public deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
  }
}

export class Missile extends Phaser.GameObjects.Sprite {
  public speed: number = 320;
  public damage: number = 80;
  public splashRadius: number = 75;
  private targetEnemy: Enemy | null = null;
  private targetX: number = 0;
  private targetY: number = 0;
  private juice?: JuiceManager;
  private enemiesGroup?: Enemy[];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'projectile_rocket');
    scene.add.existing(this);
    this.setDepth(9);
  }

  public launch(
    startX: number,
    startY: number,
    target: Enemy,
    damage: number,
    splashRadius: number,
    enemies: Enemy[],
    juice?: JuiceManager
  ): void {
    this.setPosition(startX, startY);
    this.targetEnemy = target;
    this.targetX = target.x;
    this.targetY = target.y;
    this.damage = damage;
    this.splashRadius = splashRadius;
    this.enemiesGroup = enemies;
    this.juice = juice;
    this.setActive(true);
    this.setVisible(true);

    const angle = Phaser.Math.Angle.Between(startX, startY, target.x, target.y);
    this.setRotation(angle);
  }

  public update(_time: number, delta: number): void {
    if (!this.active) return;

    if (this.targetEnemy && this.targetEnemy.active && !this.targetEnemy.isDead) {
      this.targetX = this.targetEnemy.x;
      this.targetY = this.targetEnemy.y;
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    // Homing smooth rotation
    const targetAngle = Math.atan2(dy, dx);
    this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, targetAngle, 0.12);

    const step = (this.speed * delta) / 1000;
    this.x += Math.cos(this.rotation) * step;
    this.y += Math.sin(this.rotation) * step;

    if (dist < 18) {
      this.explode();
    }
  }

  private explode(): void {
    if (this.juice) {
      this.juice.explode(this.x, this.y, 0xff3b30, 22, 1.4);
      this.juice.shakeCamera(0.012, 160);
    }

    // Splash damage to all nearby enemies
    if (this.enemiesGroup) {
      this.enemiesGroup.forEach(enemy => {
        if (enemy.active && !enemy.isDead) {
          const d = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
          if (d <= this.splashRadius) {
            const falloff = 1 - (d / this.splashRadius) * 0.4;
            enemy.takeDamage(this.damage * falloff, false, this.juice);
          }
        }
      });
    }

    this.deactivate();
  }

  public deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
  }
}

export class BeamRenderer {
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(7);
  }

  public renderLaser(startX: number, startY: number, targetX: number, targetY: number, width: number = 3): void {
    this.graphics.clear();
    // Outer glow
    this.graphics.lineStyle(width * 2.5, 0x00f2ff, 0.35);
    this.graphics.lineBetween(startX, startY, targetX, targetY);

    // Core beam
    this.graphics.lineStyle(width, 0xffffff, 0.95);
    this.graphics.lineBetween(startX, startY, targetX, targetY);
  }

  public renderLightning(points: { x: number; y: number }[]): void {
    this.graphics.clear();
    if (points.length < 2) return;

    this.graphics.lineStyle(3, 0xbf5af2, 0.85);
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      // Jagged zig-zag lightning
      const midX = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 20;
      const midY = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 20;

      this.graphics.lineBetween(p1.x, p1.y, midX, midY);
      this.graphics.lineBetween(midX, midY, p2.x, p2.y);
    }
  }

  public clear(): void {
    this.graphics.clear();
  }
}
