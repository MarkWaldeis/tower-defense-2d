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

  // Visuals
  private sprite: Phaser.GameObjects.Sprite;
  private healthBarBg: Phaser.GameObjects.Graphics;
  private healthBarFill: Phaser.GameObjects.Graphics;
  private bossCrown?: Phaser.GameObjects.Text;
  private bossAura?: Phaser.GameObjects.Graphics;

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

    // Boss Aura
    if (this.stats.isBoss) {
      this.bossAura = scene.add.graphics();
      this.bossAura.fillStyle(type === 'MUMMY' ? 0xeab308 : 0x9333ea, 0.25);
      this.bossAura.fillCircle(0, 0, this.stats.size * 1.6);
      this.add(this.bossAura);

      scene.tweens.add({
        targets: this.bossAura,
        scaleX: 1.25,
        scaleY: 1.25,
        alpha: 0.1,
        duration: 900,
        yoyo: true,
        repeat: -1
      });
    }

    // Sprite
    this.sprite = scene.add.sprite(0, 0, `enemy_${type.toLowerCase()}`);
    this.add(this.sprite);

    // Health bar
    this.healthBarBg = scene.add.graphics();
    this.healthBarFill = scene.add.graphics();
    this.add(this.healthBarBg);
    this.add(this.healthBarFill);

    if (this.stats.isBoss) {
      this.bossCrown = scene.add.text(0, -this.stats.size - 18, type === 'MUMMY' ? '👑 PHARAO' : '👑 BOSS', {
        fontFamily: '-apple-system, Inter, sans-serif',
        fontSize: '11px',
        fontStyle: '900',
        color: '#facc15',
        stroke: '#451a03',
        strokeThickness: 3
      }).setOrigin(0.5);
      this.add(this.bossCrown);
    }

    this.updateHealthBar();

    scene.add.existing(this);
    this.setDepth(this.stats.isBoss ? 12 : 10);

    // Walking wobble animation
    scene.tweens.add({
      targets: this.sprite,
      angle: { from: -4, to: 4 },
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public setCallbacks(
    onDeath: (enemy: Enemy) => void,
    onReachBase: (enemy: Enemy) => void
  ): void {
    this.onDeathCallback = onDeath;
    this.onReachBaseCallback = onReachBase;
  }

  public takeDamage(amount: number, ignoresArmor: boolean = false, juice?: JuiceManager): void {
    if (this.isDead || this.hasReachedBase) return;

    let effectiveDamage = amount;
    if (!ignoresArmor && this.stats.armor > 0) {
      effectiveDamage = Math.max(1, amount - this.stats.armor);
    }

    this.currentHp -= effectiveDamage;

    if (juice) {
      juice.showFloatingDamage(
        this.x,
        this.y,
        effectiveDamage,
        ignoresArmor ? '#c084fc' : '#ffffff',
        effectiveDamage > 35 || !!this.stats.isBoss
      );
    }

    // Flash white on hit
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (this.active && !this.isDead) {
        this.sprite.clearTint();
      }
    });

    this.updateHealthBar();

    if (this.currentHp <= 0) {
      this.die(juice);
    }
  }

  private updateHealthBar(): void {
    this.healthBarBg.clear();
    this.healthBarFill.clear();

    if (this.currentHp >= this.maxHp && !this.stats.isBoss) return;

    const barW = Math.max(32, this.stats.size * (this.stats.isBoss ? 2 : 1.5));
    const barH = this.stats.isBoss ? 6 : 4;
    const barY = -this.stats.size - (this.stats.isBoss ? 10 : 8);

    this.healthBarBg.fillStyle(0x000000, 0.8);
    this.healthBarBg.fillRoundedRect(-barW / 2, barY, barW, barH, 2);

    const pct = Math.max(0, this.currentHp / this.maxHp);
    const color = pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xeab308 : 0xef4444;

    this.healthBarFill.fillStyle(color, 1);
    this.healthBarFill.fillRoundedRect(-barW / 2, barY, barW * pct, barH, 2);
  }

  public update(_time: number, delta: number): void {
    if (this.isDead || this.hasReachedBase) return;

    if (this.waypointIndex < this.waypoints.length) {
      const target = this.waypoints[this.waypointIndex];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy);

      // Flip sprite based on movement direction
      if (dx < 0) {
        this.sprite.setFlipX(true);
      } else if (dx > 0) {
        this.sprite.setFlipX(false);
      }

      const speed = this.stats.speed;
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
        juice.hitStop(100);
      }
    }

    if (this.onDeathCallback) {
      this.onDeathCallback(this);
    }

    this.destroy();
  }
}
