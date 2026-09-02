import Phaser from 'phaser';

export class JuiceManager {
  private scene: Phaser.Scene;
  private particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initParticles();
  }

  private initParticles(): void {
    // Generate particle texture if not already cached
    if (!this.scene.textures.exists('particle_spark')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('particle_spark', 8, 8);
      g.destroy();
    }

    this.particleEmitter = this.scene.add.particles(0, 0, 'particle_spark', {
      speed: { min: 40, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 250, max: 450 },
      blendMode: 'ADD',
      emitting: false
    });
    this.particleEmitter.setDepth(15);
  }

  public showFloatingDamage(x: number, y: number, amount: number, color: string = '#ffffff', isCrit: boolean = false): void {
    const text = this.scene.add.text(x + Phaser.Math.Between(-8, 8), y - 10, isCrit ? `${Math.round(amount)}!` : `${Math.round(amount)}`, {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: isCrit ? '18px' : '13px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets: text,
      y: y - (isCrit ? 40 : 25),
      alpha: 0,
      scale: isCrit ? 1.4 : 1.1,
      duration: isCrit ? 800 : 550,
      ease: 'Cubic.out',
      onComplete: () => text.destroy()
    });
  }

  public showFloatingGold(x: number, y: number, amount: number): void {
    const text = this.scene.add.text(x, y - 15, `+${amount} 🪙`, {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd60a',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);

    this.scene.tweens.add({
      targets: text,
      y: y - 35,
      alpha: 0,
      duration: 700,
      ease: 'Back.out',
      onComplete: () => text.destroy()
    });
  }

  public explode(x: number, y: number, tint: number = 0xff9f0a, count: number = 14, scale: number = 1): void {
    if (this.particleEmitter) {
      this.particleEmitter.setParticleTint(tint);
      this.particleEmitter.explode(count, x, y);
    }

    // Shockwave ring
    const ring = this.scene.add.circle(x, y, 6, tint, 0.4).setDepth(14);
    this.scene.tweens.add({
      targets: ring,
      radius: 35 * scale,
      alpha: 0,
      duration: 300,
      ease: 'Quad.out',
      onComplete: () => ring.destroy()
    });
  }

  public shakeCamera(intensity: number = 0.008, duration: number = 120): void {
    this.scene.cameras.main.shake(duration, intensity);
  }

  public hitStop(durationMs: number = 40): void {
    // Subtle freeze-frame for massive boss hit or critical shot
    const originalTimeScale = this.scene.time.timeScale;
    this.scene.time.timeScale = 0.05;
    this.scene.time.delayedCall(durationMs, () => {
      this.scene.time.timeScale = originalTimeScale;
    });
  }
}
