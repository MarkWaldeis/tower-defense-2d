import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public create(): void {
    this.generateFantasyTextures();
    this.scene.start('WorldMapScene');
  }

  private generateFantasyTextures(): void {
    // 1. Build Spot Foundation (Circular Stone Plinth with Wooden Hammer Flag)
    const gSpot = this.make.graphics({ x: 0, y: 0 });
    // Outer stone ring
    gSpot.fillStyle(0xd4a373, 0.4);
    gSpot.fillCircle(30, 30, 26);
    gSpot.lineStyle(3, 0x8d6b4f, 0.9);
    gSpot.strokeCircle(30, 30, 26);
    // Inner foundation circle
    gSpot.fillStyle(0xe9c46a, 0.5);
    gSpot.fillCircle(30, 30, 18);
    gSpot.lineStyle(1.5, 0xb08968, 1);
    gSpot.strokeCircle(30, 30, 18);
    // Hammer / Build icon in center
    gSpot.fillStyle(0x7f4f24, 1);
    gSpot.fillRect(28, 22, 4, 16);
    gSpot.fillRect(23, 20, 14, 6);
    gSpot.generateTexture('build_spot_empty', 60, 60);
    gSpot.destroy();

    // 2. Tower: Basic Slinger (Wooden Lookout Tower with Stone Base)
    const gSlinger = this.make.graphics({ x: 0, y: 0 });
    // Stone base
    gSlinger.fillStyle(0xa8a29e, 1);
    gSlinger.fillRoundedRect(10, 36, 44, 20, 4);
    gSlinger.lineStyle(2, 0x57534e, 1);
    gSlinger.strokeRoundedRect(10, 36, 44, 20, 4);
    // Wooden Tower Beams
    gSlinger.fillStyle(0x92400e, 1);
    gSlinger.fillRect(16, 14, 32, 26);
    gSlinger.lineStyle(2, 0x451a03, 1);
    gSlinger.strokeRect(16, 14, 32, 26);
    // Parapet / Lookout
    gSlinger.fillStyle(0xb45309, 1);
    gSlinger.fillRoundedRect(12, 8, 40, 10, 2);
    // Slinger archer
    gSlinger.fillStyle(0x22c55e, 1);
    gSlinger.fillCircle(32, 6, 5);
    gSlinger.generateTexture('tower_slinger', 64, 64);
    gSlinger.destroy();

    // 3. Tower: Crossbow Emplacement (Heavy Stone Bastion + Ballista)
    const gCrossbow = this.make.graphics({ x: 0, y: 0 });
    // Sandstone castle base
    gCrossbow.fillStyle(0xd6d3d1, 1);
    gCrossbow.fillRoundedRect(8, 24, 48, 34, 4);
    gCrossbow.lineStyle(2.5, 0x44403c, 1);
    gCrossbow.strokeRoundedRect(8, 24, 48, 34, 4);
    // Battlements
    gCrossbow.fillRect(10, 18, 10, 8);
    gCrossbow.fillRect(27, 18, 10, 8);
    gCrossbow.fillRect(44, 18, 10, 8);
    // Wooden Heavy Crossbow on top
    gCrossbow.fillStyle(0x78350f, 1);
    gCrossbow.fillRect(30, 8, 4, 18);
    gCrossbow.lineStyle(3, 0x92400e, 1);
    gCrossbow.lineBetween(18, 16, 46, 16);
    gCrossbow.generateTexture('tower_crossbow', 64, 64);
    gCrossbow.destroy();

    // 4. Tower: Rune Mage (Floating Arcane Stone Altar with Glyphs)
    const gMage = this.make.graphics({ x: 0, y: 0 });
    // Altar Platform
    gMage.fillStyle(0x78716c, 1);
    gMage.fillCircle(32, 42, 22);
    gMage.lineStyle(3, 0x44403c, 1);
    gMage.strokeCircle(32, 42, 22);
    // Glowing purple magic circle
    gMage.fillStyle(0xc084fc, 0.4);
    gMage.fillCircle(32, 42, 16);
    gMage.lineStyle(2, 0xa855f7, 1);
    gMage.strokeCircle(32, 42, 16);
    // Hooded Sorcerer figure
    gMage.fillStyle(0x3b82f6, 1);
    gMage.fillTriangle(32, 12, 20, 36, 44, 36);
    gMage.fillStyle(0xfde047, 1);
    gMage.fillCircle(32, 18, 4);
    // Glowing Arcane Orbs
    gMage.fillStyle(0xd946ef, 1);
    gMage.fillCircle(18, 22, 4);
    gMage.fillCircle(46, 22, 4);
    gMage.generateTexture('tower_mage', 64, 64);
    gMage.destroy();

    // 5. Tower: Heavy Dragon Mortar (Dragon-head artillery)
    const gMortar = this.make.graphics({ x: 0, y: 0 });
    // Stone pyramid base
    gMortar.fillStyle(0xa8a29e, 1);
    gMortar.fillRoundedRect(10, 34, 44, 24, 4);
    gMortar.lineStyle(2.5, 0x44403c, 1);
    gMortar.strokeRoundedRect(10, 34, 44, 24, 4);
    // Dragon Brass Mortar Cannon
    gMortar.fillStyle(0xb91c1c, 1);
    gMortar.fillRoundedRect(22, 10, 20, 28, 4);
    gMortar.lineStyle(2, 0xf59e0b, 1);
    gMortar.strokeRoundedRect(22, 10, 20, 28, 4);
    // Cannon Muzzle opening
    gMortar.fillStyle(0x18181b, 1);
    gMortar.fillCircle(32, 12, 7);
    gMortar.fillStyle(0xf97316, 1);
    gMortar.fillCircle(32, 12, 3);
    gMortar.generateTexture('tower_mortar', 64, 64);
    gMortar.destroy();

    // 6. Projectiles
    // Sling stone
    const gStone = this.make.graphics({ x: 0, y: 0 });
    gStone.fillStyle(0x78716c, 1);
    gStone.fillCircle(4, 4, 3.5);
    gStone.generateTexture('projectile_slinger', 8, 8);
    gStone.destroy();

    // Crossbow Bolt
    const gBolt = this.make.graphics({ x: 0, y: 0 });
    gBolt.fillStyle(0x78350f, 1);
    gBolt.fillRect(0, 3, 12, 2);
    gBolt.fillStyle(0x94a3b8, 1);
    gBolt.fillTriangle(14, 4, 10, 1, 10, 7);
    gBolt.generateTexture('projectile_crossbow', 16, 8);
    gBolt.destroy();

    // Rune Magic Bolt
    const gRune = this.make.graphics({ x: 0, y: 0 });
    gRune.fillStyle(0xd946ef, 0.4);
    gRune.fillCircle(6, 6, 6);
    gRune.fillStyle(0xc084fc, 1);
    gRune.fillCircle(6, 6, 4);
    gRune.fillStyle(0xffffff, 1);
    gRune.fillCircle(6, 6, 2);
    gRune.generateTexture('projectile_mage', 12, 12);
    gRune.destroy();

    // Dragon Mortar Bomb
    const gBomb = this.make.graphics({ x: 0, y: 0 });
    gBomb.fillStyle(0x1c1917, 1);
    gBomb.fillCircle(7, 7, 6);
    gBomb.fillStyle(0xf97316, 1);
    gBomb.fillCircle(9, 5, 2.5);
    gBomb.generateTexture('projectile_mortar', 14, 14);
    gBomb.destroy();

    // 7. Enemy: Sand Goblin (Green goblin with pickaxe)
    const gGoblin = this.make.graphics({ x: 0, y: 0 });
    // Ears
    gGoblin.fillStyle(0x84cc16, 1);
    gGoblin.fillTriangle(4, 14, 14, 10, 14, 18);
    gGoblin.fillTriangle(28, 14, 18, 10, 18, 18);
    // Head & Body
    gGoblin.fillCircle(16, 14, 7);
    gGoblin.fillStyle(0x78350f, 1);
    gGoblin.fillRect(11, 20, 10, 10);
    // Eyes & Pickaxe
    gGoblin.fillStyle(0xfef08a, 1);
    gGoblin.fillCircle(14, 13, 1.5);
    gGoblin.fillCircle(18, 13, 1.5);
    gGoblin.fillStyle(0x71717a, 1);
    gGoblin.fillRect(21, 14, 3, 12);
    gGoblin.fillRect(17, 12, 11, 3);
    gGoblin.generateTexture('enemy_goblin', 32, 32);
    gGoblin.destroy();

    // 8. Enemy: Giant Dune Scutter / Scorpion (Armored Crawler)
    const gScutter = this.make.graphics({ x: 0, y: 0 });
    gScutter.fillStyle(0xd97706, 1);
    gScutter.fillCircle(18, 18, 9);
    gScutter.lineStyle(2, 0x92400e, 1);
    gScutter.strokeCircle(18, 18, 9);
    // Pincers
    gScutter.fillStyle(0xb45309, 1);
    gScutter.fillTriangle(26, 12, 34, 8, 30, 16);
    gScutter.fillTriangle(26, 24, 34, 28, 30, 20);
    // Stinger Tail
    gScutter.lineStyle(3, 0xb45309, 1);
    gScutter.lineBetween(10, 18, 2, 10);
    gScutter.fillStyle(0xef4444, 1);
    gScutter.fillCircle(3, 9, 3);
    gScutter.generateTexture('enemy_scutter', 36, 36);
    gScutter.destroy();

    // 9. Enemy: Ancient Stone Golem (Ruin block Colossus)
    const gGolem = this.make.graphics({ x: 0, y: 0 });
    gGolem.fillStyle(0xa8a29e, 1);
    gGolem.fillRoundedRect(6, 6, 36, 36, 6);
    gGolem.lineStyle(3, 0x57534e, 1);
    gGolem.strokeRoundedRect(6, 6, 36, 36, 6);
    // Stone head & glowing blue eye slits
    gGolem.fillStyle(0x78716c, 1);
    gGolem.fillRect(14, 10, 20, 12);
    gGolem.fillStyle(0x00f2ff, 1);
    gGolem.fillRect(16, 14, 6, 3);
    gGolem.fillRect(26, 14, 6, 3);
    gGolem.generateTexture('enemy_golem', 48, 48);
    gGolem.destroy();

    // 10. Enemy: Vulture Rider (Desert Vulture)
    const gVulture = this.make.graphics({ x: 0, y: 0 });
    gVulture.fillStyle(0x78350f, 1);
    // Wings
    gVulture.fillTriangle(20, 20, 2, 8, 14, 28);
    gVulture.fillTriangle(20, 20, 38, 8, 26, 28);
    // Body & Beak
    gVulture.fillCircle(20, 18, 7);
    gVulture.fillStyle(0xf59e0b, 1);
    gVulture.fillTriangle(20, 24, 17, 34, 23, 34);
    // Goblin rider on back
    gVulture.fillStyle(0x84cc16, 1);
    gVulture.fillCircle(20, 14, 4);
    gVulture.generateTexture('enemy_vulture', 40, 40);
    gVulture.destroy();

    // 11. Enemy: Desert Sorcerer (Dark purple boss with glowing aura)
    const gSorcerer = this.make.graphics({ x: 0, y: 0 });
    // Magic Aura Ring
    gSorcerer.fillStyle(0x9333ea, 0.35);
    gSorcerer.fillCircle(24, 24, 22);
    gSorcerer.lineStyle(2, 0xa855f7, 0.8);
    gSorcerer.strokeCircle(24, 24, 22);
    // Robe & Hood
    gSorcerer.fillStyle(0x4c1d95, 1);
    gSorcerer.fillTriangle(24, 8, 10, 38, 38, 38);
    gSorcerer.fillStyle(0x1e1b4b, 1);
    gSorcerer.fillCircle(24, 16, 7);
    // Glowing Eyes & Floating Orb
    gSorcerer.fillStyle(0xfbbf24, 1);
    gSorcerer.fillCircle(22, 16, 1.5);
    gSorcerer.fillCircle(26, 16, 1.5);
    gSorcerer.fillStyle(0xd946ef, 1);
    gSorcerer.fillCircle(38, 18, 4);
    gSorcerer.generateTexture('enemy_sorcerer', 48, 48);
    gSorcerer.destroy();
  }
}
