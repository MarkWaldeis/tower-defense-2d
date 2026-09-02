import Phaser from 'phaser';
import { Enemy } from '../enemies/Enemy';
import { JuiceManager } from '../../systems/JuiceManager';

export class FantasyProjectile extends Phaser.GameObjects.Sprite {
  public speed: number = 550;
  public damage: number = 15;
  public splashRadius: number = 0;
  public ignoresArmor: boolean = false;
  private targetEnemy: Enemy | null = null;
  private targetX: number = 0;
  private targetY: number = 0;
  private juice?: JuiceManager;
  private allEnemies?: Enemy[];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 'projectile_slinger');
    scene.add.existing(this);
    this.setDepth(12);
  }

  public fire(
    textureKey: string,
    startX: number,
    startY: number,
    target: Enemy,
    damage: number,
    speed: number,
    splashRadius: number = 0,
    ignoresArmor: boolean = false,
    allEnemies?: Enemy[],
    juice?: JuiceManager
  ): void {
    this.setTexture(textureKey);
    this.setPosition(startX, startY);
    this.targetEnemy = target;
    this.targetX = target.x;
    this.targetY = target.y;
    this.damage = damage;
    this.speed = speed;
    this.splashRadius = splashRadius;
    this.ignoresArmor = ignoresArmor;
    this.allEnemies = allEnemies;
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
    const step = (this.speed * delta) / 1000;

    if (dist <= step || dist < 14) {
      this.hitTarget();
    } else {
      this.x += (dx / dist) * step;
      this.y += (dy / dist) * step;
      this.setRotation(Math.atan2(dy, dx));
    }
  }

  private hitTarget(): void {
    if (this.splashRadius > 0) {
      // Mortar explosive AoE
      if (this.juice) {
        this.juice.explode(this.x, this.y, 0xef4444, 25, 1.5);
        this.juice.shakeCamera(0.012, 160);
      }

      if (this.allEnemies) {
        this.allEnemies.forEach(e => {
          if (e.active && !e.isDead) {
            const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
            if (d <= this.splashRadius) {
              const falloff = 1 - (d / this.splashRadius) * 0.4;
              e.takeDamage(this.damage * falloff, this.ignoresArmor, this.juice);
            }
          }
        });
      }
    } else {
      // Single target hit
      if (this.targetEnemy && this.targetEnemy.active && !this.targetEnemy.isDead) {
        this.targetEnemy.takeDamage(this.damage, this.ignoresArmor, this.juice);
      }
    }

    this.deactivate();
  }

  public deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
  }
}
