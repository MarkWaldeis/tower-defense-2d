import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public preload(): void {
    // 1. Load AAA High-Res Generated Hand-Drawn Backgrounds & Assets
    this.load.image('map_desert_ruins', 'assets/desert_ruins_map.jpg');
    this.load.image('map_world_campaign', 'assets/world_map.jpg');
    this.load.image('tower_slinger_img', 'assets/tower_slinger.jpg');
    this.load.image('tower_crossbow_img', 'assets/tower_crossbow.jpg');
    this.load.image('tower_mage_img', 'assets/tower_mage.jpg');
    this.load.image('tower_mortar_img', 'assets/tower_mortar.jpg');
    this.load.image('enemy_goblin_img', 'assets/enemy_goblin.jpg');
    this.load.image('enemy_golem_img', 'assets/enemy_golem.jpg');
    this.load.image('enemy_scutter_img', 'assets/enemy_scutter.jpg');
    this.load.image('hero_valkyrie_img', 'assets/hero_valkyrie.jpg');
  }

  public create(): void {
    this.generateProceduralSprites();
    this.scene.start('WorldMapScene');
  }

  private generateProceduralSprites(): void {
    // 1. Build Spot Foundation Pad
    const gSpot = this.make.graphics({ x: 0, y: 0 });
    gSpot.fillStyle(0xd4a373, 0.5);
    gSpot.fillCircle(30, 30, 26);
    gSpot.lineStyle(3, 0x8d6b4f, 0.9);
    gSpot.strokeCircle(30, 30, 26);
    gSpot.fillStyle(0xe9c46a, 0.6);
    gSpot.fillCircle(30, 30, 18);
    gSpot.lineStyle(1.5, 0xb08968, 1);
    gSpot.strokeCircle(30, 30, 18);
    gSpot.fillStyle(0x7f4f24, 1);
    gSpot.fillRect(28, 22, 4, 16);
    gSpot.fillRect(23, 20, 14, 6);
    gSpot.generateTexture('build_spot_empty', 60, 60);
    gSpot.destroy();

    // 2. Projectiles
    const gStone = this.make.graphics({ x: 0, y: 0 });
    gStone.fillStyle(0x57534e, 1);
    gStone.fillCircle(4, 4, 3.5);
    gStone.lineStyle(1, 0x292524, 1);
    gStone.strokeCircle(4, 4, 3.5);
    gStone.generateTexture('projectile_slinger', 8, 8);
    gStone.destroy();

    const gBolt = this.make.graphics({ x: 0, y: 0 });
    gBolt.fillStyle(0x78350f, 1);
    gBolt.fillRect(0, 3, 14, 2);
    gBolt.fillStyle(0x94a3b8, 1);
    gBolt.fillTriangle(16, 4, 11, 1, 11, 7);
    gBolt.generateTexture('projectile_crossbow', 18, 8);
    gBolt.destroy();

    const gRune = this.make.graphics({ x: 0, y: 0 });
    gRune.fillStyle(0xd946ef, 0.4);
    gRune.fillCircle(7, 7, 7);
    gRune.fillStyle(0xc084fc, 1);
    gRune.fillCircle(7, 7, 4.5);
    gRune.fillStyle(0xffffff, 1);
    gRune.fillCircle(7, 7, 2.5);
    gRune.generateTexture('projectile_mage', 14, 14);
    gRune.destroy();

    const gBomb = this.make.graphics({ x: 0, y: 0 });
    gBomb.fillStyle(0x1c1917, 1);
    gBomb.fillCircle(8, 8, 7);
    gBomb.fillStyle(0xf97316, 1);
    gBomb.fillCircle(10, 6, 3);
    gBomb.generateTexture('projectile_mortar', 16, 16);
    gBomb.destroy();

    // 3. Fallback / Vector Sprites (if textures need mask or avatar)
    const gGoblin = this.make.graphics({ x: 0, y: 0 });
    gGoblin.fillStyle(0x84cc16, 1);
    gGoblin.fillTriangle(4, 14, 14, 10, 14, 18);
    gGoblin.fillTriangle(28, 14, 18, 10, 18, 18);
    gGoblin.fillCircle(16, 14, 7);
    gGoblin.fillStyle(0x78350f, 1);
    gGoblin.fillRect(11, 20, 10, 10);
    gGoblin.fillStyle(0xfef08a, 1);
    gGoblin.fillCircle(14, 13, 1.5);
    gGoblin.fillCircle(18, 13, 1.5);
    gGoblin.fillStyle(0x71717a, 1);
    gGoblin.fillRect(21, 14, 3, 12);
    gGoblin.fillRect(17, 12, 11, 3);
    gGoblin.generateTexture('enemy_goblin', 32, 32);
    gGoblin.destroy();

    const gScutter = this.make.graphics({ x: 0, y: 0 });
    gScutter.fillStyle(0xd97706, 1);
    gScutter.fillCircle(18, 18, 9);
    gScutter.lineStyle(2, 0x92400e, 1);
    gScutter.strokeCircle(18, 18, 9);
    gScutter.fillStyle(0xb45309, 1);
    gScutter.fillTriangle(26, 12, 34, 8, 30, 16);
    gScutter.fillTriangle(26, 24, 34, 28, 30, 20);
    gScutter.lineStyle(3, 0xb45309, 1);
    gScutter.lineBetween(10, 18, 2, 10);
    gScutter.fillStyle(0xef4444, 1);
    gScutter.fillCircle(3, 9, 3);
    gScutter.generateTexture('enemy_scutter', 36, 36);
    gScutter.destroy();

    const gGolem = this.make.graphics({ x: 0, y: 0 });
    gGolem.fillStyle(0xa8a29e, 1);
    gGolem.fillRoundedRect(6, 6, 36, 36, 6);
    gGolem.lineStyle(3, 0x57534e, 1);
    gGolem.strokeRoundedRect(6, 6, 36, 36, 6);
    gGolem.fillStyle(0x78716c, 1);
    gGolem.fillRect(14, 10, 20, 12);
    gGolem.fillStyle(0x00f2ff, 1);
    gGolem.fillRect(16, 14, 6, 3);
    gGolem.fillRect(26, 14, 6, 3);
    gGolem.generateTexture('enemy_golem', 48, 48);
    gGolem.destroy();

    const gVulture = this.make.graphics({ x: 0, y: 0 });
    gVulture.fillStyle(0x78350f, 1);
    gVulture.fillTriangle(20, 20, 2, 8, 14, 28);
    gVulture.fillTriangle(20, 20, 38, 8, 26, 28);
    gVulture.fillCircle(20, 18, 7);
    gVulture.fillStyle(0xf59e0b, 1);
    gVulture.fillTriangle(20, 24, 17, 34, 23, 34);
    gVulture.fillStyle(0x84cc16, 1);
    gVulture.fillCircle(20, 14, 4);
    gVulture.generateTexture('enemy_vulture', 40, 40);
    gVulture.destroy();

    const gSorcerer = this.make.graphics({ x: 0, y: 0 });
    gSorcerer.fillStyle(0x9333ea, 0.35);
    gSorcerer.fillCircle(24, 24, 22);
    gSorcerer.lineStyle(2, 0xa855f7, 0.8);
    gSorcerer.strokeCircle(24, 24, 22);
    gSorcerer.fillStyle(0x4c1d95, 1);
    gSorcerer.fillTriangle(24, 8, 10, 38, 38, 38);
    gSorcerer.fillStyle(0x1e1b4b, 1);
    gSorcerer.fillCircle(24, 16, 7);
    gSorcerer.fillStyle(0xfbbf24, 1);
    gSorcerer.fillCircle(22, 16, 1.5);
    gSorcerer.fillCircle(26, 16, 1.5);
    gSorcerer.fillStyle(0xd946ef, 1);
    gSorcerer.fillCircle(38, 18, 4);
    gSorcerer.generateTexture('enemy_sorcerer', 48, 48);
    gSorcerer.destroy();
  }
}
