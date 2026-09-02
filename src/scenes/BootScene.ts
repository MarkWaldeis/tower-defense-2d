import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public create(): void {
    this.generateProceduralTextures();
    this.scene.start('MainMenuScene');
  }

  private generateProceduralTextures(): void {
    // 1. Tower Base
    const gBase = this.make.graphics({ x: 0, y: 0 });
    gBase.fillStyle(0x1a233a, 1);
    gBase.fillCircle(24, 24, 22);
    gBase.lineStyle(2, 0x00f2ff, 0.8);
    gBase.strokeCircle(24, 24, 22);
    gBase.fillStyle(0x0f172a, 1);
    gBase.fillCircle(24, 24, 14);
    gBase.lineStyle(1.5, 0x38bdf8, 0.5);
    gBase.strokeCircle(24, 24, 14);
    gBase.generateTexture('tower_base', 48, 48);
    gBase.destroy();

    // 2. Turret: Gatling
    const gGatling = this.make.graphics({ x: 0, y: 0 });
    gGatling.fillStyle(0x38bdf8, 1);
    gGatling.fillCircle(24, 24, 12);
    // Dual barrels
    gGatling.fillStyle(0x0284c7, 1);
    gGatling.fillRect(24, 18, 18, 4);
    gGatling.fillRect(24, 26, 18, 4);
    gGatling.fillStyle(0x00f2ff, 1);
    gGatling.fillRect(38, 17, 5, 6);
    gGatling.fillRect(38, 25, 5, 6);
    gGatling.generateTexture('turret_gatling', 48, 48);
    gGatling.destroy();

    // 3. Turret: Laser
    const gLaser = this.make.graphics({ x: 0, y: 0 });
    gLaser.fillStyle(0x06b6d4, 1);
    gLaser.fillCircle(24, 24, 13);
    gLaser.fillStyle(0x0891b2, 1);
    gLaser.fillTriangle(20, 14, 20, 34, 42, 24);
    gLaser.fillStyle(0x22d3ee, 1);
    gLaser.fillCircle(30, 24, 6);
    gLaser.fillStyle(0xffffff, 1);
    gLaser.fillCircle(30, 24, 3);
    gLaser.generateTexture('turret_laser', 48, 48);
    gLaser.destroy();

    // 4. Turret: Rocket
    const gRocket = this.make.graphics({ x: 0, y: 0 });
    gRocket.fillStyle(0xe11d48, 1);
    gRocket.fillRoundedRect(14, 14, 20, 20, 4);
    // Missile pods
    gRocket.fillStyle(0x1e293b, 1);
    gRocket.fillCircle(20, 19, 3);
    gRocket.fillCircle(28, 19, 3);
    gRocket.fillCircle(20, 29, 3);
    gRocket.fillCircle(28, 29, 3);
    gRocket.fillStyle(0xfb7185, 1);
    gRocket.fillCircle(20, 19, 1.5);
    gRocket.fillCircle(28, 19, 1.5);
    gRocket.fillCircle(20, 29, 1.5);
    gRocket.fillCircle(28, 29, 1.5);
    gRocket.generateTexture('turret_rocket', 48, 48);
    gRocket.destroy();

    // 5. Turret: Cryo
    const gCryo = this.make.graphics({ x: 0, y: 0 });
    gCryo.fillStyle(0x0284c7, 1);
    gCryo.fillCircle(24, 24, 13);
    gCryo.lineStyle(2, 0x38bdf8, 1);
    gCryo.strokeCircle(24, 24, 13);
    // Snowflake crystal pattern
    gCryo.lineStyle(2, 0xe0f2fe, 1);
    gCryo.lineBetween(24, 14, 24, 34);
    gCryo.lineBetween(14, 24, 34, 24);
    gCryo.lineBetween(17, 17, 31, 31);
    gCryo.lineBetween(17, 31, 31, 17);
    gCryo.generateTexture('turret_cryo', 48, 48);
    gCryo.destroy();

    // 6. Turret: Tesla
    const gTesla = this.make.graphics({ x: 0, y: 0 });
    gTesla.fillStyle(0x7c3aed, 1);
    gTesla.fillCircle(24, 24, 13);
    gTesla.lineStyle(2, 0xa78bfa, 1);
    gTesla.strokeCircle(24, 24, 13);
    gTesla.fillStyle(0xc084fc, 1);
    gTesla.fillCircle(24, 24, 7);
    gTesla.fillStyle(0xffffff, 1);
    gTesla.fillCircle(24, 24, 3);
    gTesla.generateTexture('turret_tesla', 48, 48);
    gTesla.destroy();

    // 7. Bullets & Projectiles
    const gBullet = this.make.graphics({ x: 0, y: 0 });
    gBullet.fillStyle(0x38bdf8, 1);
    gBullet.fillRoundedRect(0, 2, 12, 4, 2);
    gBullet.fillStyle(0xffffff, 1);
    gBullet.fillRoundedRect(4, 3, 6, 2, 1);
    gBullet.generateTexture('bullet_gatling', 14, 8);
    gBullet.destroy();

    const gMissile = this.make.graphics({ x: 0, y: 0 });
    gMissile.fillStyle(0xf43f5e, 1);
    gMissile.fillTriangle(18, 5, 6, 1, 6, 9);
    gMissile.fillStyle(0x475569, 1);
    gMissile.fillRect(2, 2, 6, 6);
    gMissile.generateTexture('projectile_rocket', 20, 10);
    gMissile.destroy();

    // 8. Enemy: Scout
    const gScout = this.make.graphics({ x: 0, y: 0 });
    gScout.fillStyle(0x06b6d4, 1);
    gScout.fillTriangle(26, 16, 6, 6, 6, 26);
    gScout.lineStyle(1.5, 0x22d3ee, 1);
    gScout.strokeTriangle(26, 16, 6, 6, 6, 26);
    gScout.fillStyle(0xffffff, 1);
    gScout.fillCircle(14, 16, 3);
    gScout.generateTexture('enemy_scout', 32, 32);
    gScout.destroy();

    // 9. Enemy: Raider
    const gRaider = this.make.graphics({ x: 0, y: 0 });
    gRaider.fillStyle(0xf59e0b, 1);
    gRaider.fillRoundedRect(6, 6, 24, 24, 5);
    gRaider.lineStyle(2, 0xfbbf24, 1);
    gRaider.strokeRoundedRect(6, 6, 24, 24, 5);
    gRaider.fillStyle(0x78350f, 1);
    gRaider.fillCircle(18, 18, 5);
    gRaider.generateTexture('enemy_raider', 36, 36);
    gRaider.destroy();

    // 10. Enemy: Tank
    const gTank = this.make.graphics({ x: 0, y: 0 });
    gTank.fillStyle(0xd97706, 1);
    gTank.fillRect(4, 4, 36, 36);
    gTank.lineStyle(3, 0xfbbf24, 1);
    gTank.strokeRect(4, 4, 36, 36);
    // Treads & Turret
    gTank.fillStyle(0x451a03, 1);
    gTank.fillRect(4, 2, 36, 4);
    gTank.fillRect(4, 38, 36, 4);
    gTank.fillStyle(0xef4444, 1);
    gTank.fillCircle(22, 22, 9);
    gTank.generateTexture('enemy_tank', 44, 44);
    gTank.destroy();

    // 11. Enemy: Shield Drone
    const gShield = this.make.graphics({ x: 0, y: 0 });
    gShield.fillStyle(0x8b5cf6, 0.4);
    gShield.fillCircle(20, 20, 18);
    gShield.lineStyle(2, 0xa78bfa, 0.9);
    gShield.strokeCircle(20, 20, 18);
    gShield.fillStyle(0x6d28d9, 1);
    gShield.fillTriangle(20, 8, 32, 28, 8, 28);
    gShield.generateTexture('enemy_shield_drone', 40, 40);
    gShield.destroy();

    // 12. Enemy: Boss Titan
    const gBoss = this.make.graphics({ x: 0, y: 0 });
    gBoss.fillStyle(0x991b1b, 1);
    gBoss.fillCircle(32, 32, 28);
    gBoss.lineStyle(4, 0xef4444, 1);
    gBoss.strokeCircle(32, 32, 28);
    // Reactor Core Glow
    gBoss.fillStyle(0xfbbf24, 1);
    gBoss.fillCircle(32, 32, 14);
    gBoss.fillStyle(0xffffff, 1);
    gBoss.fillCircle(32, 32, 6);
    gBoss.generateTexture('enemy_boss', 64, 64);
    gBoss.destroy();
  }
}
