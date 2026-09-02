import Phaser from 'phaser';

export class JuiceManager {
  private scene: Phaser.Scene;
  private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private lightningGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.lightningGraphics = scene.add.graphics().setDepth(25);
    this.initParticles();
  }

  private initParticles(): void {
    if (!this.scene.textures.exists('particle_spark')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('particle_spark', 8, 8);
      g.destroy();
    }

    this.particleEmitter = this.scene.add.particles(0, 0, 'particle_spark', {
      speed: { min: 40, max: 190 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 250, max: 500 },
      blendMode: 'ADD',
      emitting: false
    });
    this.particleEmitter.setDepth(15);
  }

  public showFloatingDamage(x: number, y: number, amount: number, color: string = '#ffffff', isCrit: boolean = false): void {
    const text = this.scene.add.text(x + Phaser.Math.Between(-8, 8), y - 10, isCrit ? `${Math.round(amount)}!` : `${Math.round(amount)}`, {
      fontFamily: '-apple-system, Inter, "Segoe UI", sans-serif',
      fontSize: isCrit ? '18px' : '13px',
      fontStyle: '900',
      color: color,
      stroke: '#2c1810',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets: text,
      y: y - (isCrit ? 40 : 25),
      alpha: 0,
      scale: isCrit ? 1.4 : 1.1,
      duration: isCrit ? 750 : 500,
      ease: 'Cubic.out',
      onComplete: () => text.destroy()
    });
  }

  public showFloatingText(x: number, y: number, msg: string, color: string = '#facc15'): void {
    const text = this.scene.add.text(x, y - 10, msg, {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '13px',
      fontStyle: '900',
      color: color,
      stroke: '#451a03',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets: text,
      y: y - 35,
      alpha: 0,
      scale: 1.2,
      duration: 700,
      ease: 'Back.out',
      onComplete: () => text.destroy()
    });
  }

  public showFloatingGold(x: number, y: number, amount: number): void {
    const text = this.scene.add.text(x, y - 15, `+${amount} 🪙`, {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd60a',
      stroke: '#3b200b',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets: text,
      y: y - 35,
      alpha: 0,
      duration: 650,
      ease: 'Back.out',
      onComplete: () => text.destroy()
    });
  }

  public explode(x: number, y: number, tint: number = 0xf59e0b, count: number = 14, scale: number = 1): void {
    if (this.particleEmitter) {
      this.particleEmitter.setParticleTint(tint);
      this.particleEmitter.explode(count, x, y);
    }

    const ring = this.scene.add.circle(x, y, 6, tint, 0.45).setDepth(14);
    this.scene.tweens.add({
      targets: ring,
      radius: 35 * scale,
      alpha: 0,
      duration: 300,
      ease: 'Quad.out',
      onComplete: () => ring.destroy()
    });
  }

  public drawLightningStrike(fromX: number, fromY: number, targetX: number, targetY: number, chainTargets: { x: number; y: number }[] = []): void {
    this.lightningGraphics.clear();
    this.lightningGraphics.lineStyle(4, 0x00f2ff, 1);

    const drawBolt = (x1: number, y1: number, x2: number, y2: number) => {
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(3, Math.floor(dist / 25));
      let curX = x1;
      let curY = y1;

      this.lightningGraphics.beginPath();
      this.lightningGraphics.moveTo(curX, curY);

      for (let i = 1; i <= steps; i++) {
        const progress = i / steps;
        const nextX = x1 + (x2 - x1) * progress + (i < steps ? (Math.random() - 0.5) * 25 : 0);
        const nextY = y1 + (y2 - y1) * progress + (i < steps ? (Math.random() - 0.5) * 25 : 0);
        this.lightningGraphics.lineTo(nextX, nextY);
        curX = nextX;
        curY = nextY;
      }
      this.lightningGraphics.strokePath();
    };

    // Main sky strike
    drawBolt(fromX, fromY, targetX, targetY);

    // Branching chain hits
    chainTargets.forEach(ct => {
      drawBolt(targetX, targetY, ct.x, ct.y);
    });

    this.scene.time.delayedCall(120, () => {
      this.lightningGraphics.clear();
    });
  }

  public shakeCamera(intensity: number = 0.008, duration: number = 120): void {
    this.scene.cameras.main.shake(duration, intensity);
  }

  public hitStop(durationMs: number = 40): void {
    const originalTimeScale = this.scene.time.timeScale;
    this.scene.time.timeScale = 0.05;
    this.scene.time.delayedCall(durationMs, () => {
      this.scene.time.timeScale = originalTimeScale;
    });
  }
}
