import Phaser from 'phaser';
import { MAPS } from '../config/GameConfig';
import { SaveManager } from '../systems/SaveManager';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';

interface StageNode {
  id: number;
  x: number;
  y: number;
  name: string;
  region: string;
}

export class WorldMapScene extends Phaser.Scene {
  private stageNodes: StageNode[] = [
    { id: 1, x: 240, y: 380, name: 'Sonnental-Ruinen & Oase', region: 'Al-Kharid Oase' },
    { id: 2, x: 520, y: 260, name: 'Knochen-Canyon', region: 'Todesdünen' },
    { id: 3, x: 800, y: 390, name: 'Sonnen-Pyramide', region: 'Königsgräber' }
  ];

  private cardContainer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super('WorldMapScene');
  }

  public create(): void {
    const { width, height } = this.scale;

    // Hide gameplay HUD in World Map
    const hud = document.getElementById('hud-overlay');
    if (hud) hud.classList.add('hidden');

    // 1. Render Illustrated Hand-Drawn Desert World Map
    this.renderHandDrawnWorldMap(width, height);

    // 2. Render Stage Paths & Connecting Dots
    this.renderPathConnections();

    // 3. Render Stage Flags / Nodes
    this.renderStageNodes();

    // 4. Render Top Campaign Bar (Parchment Title, Total Stars, Audio)
    this.renderTopCampaignBar(width);
  }

  private renderHandDrawnWorldMap(width: number, height: number): void {
    const g = this.add.graphics();

    // Sandstone Base Gradient
    g.fillGradientStyle(0xdfba81, 0xdfba81, 0xc89858, 0xc89858, 1);
    g.fillRect(0, 0, width, height);

    // Dune ridges (Layered curves with points)
    g.fillStyle(0xcca062, 0.6);
    g.beginPath();
    g.moveTo(0, 180);
    g.lineTo(200, 150);
    g.lineTo(450, 220);
    g.lineTo(700, 160);
    g.lineTo(850, 140);
    g.lineTo(width, 170);
    g.lineTo(width, height);
    g.lineTo(0, height);
    g.closePath();
    g.fill();

    // Southern Great Dunes
    g.fillStyle(0xb58444, 0.4);
    g.beginPath();
    g.moveTo(0, 480);
    g.lineTo(300, 430);
    g.lineTo(600, 520);
    g.lineTo(width, 460);
    g.lineTo(width, height);
    g.lineTo(0, height);
    g.closePath();
    g.fill();

    // Mountains at the north border
    g.fillStyle(0x8c6239, 0.9);
    for (let x = 40; x < width; x += 110) {
      const peakH = Phaser.Math.Between(55, 90);
      g.fillTriangle(x, 110, x - 55, 110 + peakH, x + 55, 110 + peakH);
      // Mountain snow/sand highlights
      g.fillStyle(0xd6a869, 0.6);
      g.fillTriangle(x, 110, x - 20, 110 + peakH * 0.4, x + 20, 110 + peakH * 0.4);
      g.fillStyle(0x8c6239, 0.9);
    }

    // Oasis Water Pool near Node 1
    g.fillStyle(0x38bdf8, 0.9);
    g.fillEllipse(360, 430, 80, 45);
    g.lineStyle(3, 0x0284c7, 1);
    g.strokeEllipse(360, 430, 80, 45);
    // Oasis Palm trees
    this.drawPalmTree(330, 405);
    this.drawPalmTree(400, 415);
    this.drawPalmTree(370, 455);

    // Ancient Ruin Pillars near Node 2
    g.fillStyle(0xa8a29e, 1);
    g.fillRect(570, 210, 14, 42);
    g.fillRect(600, 210, 14, 42);
    g.fillRect(565, 202, 54, 10);
    g.lineStyle(2, 0x44403c, 1);
    g.strokeRect(570, 210, 14, 42);
    g.strokeRect(600, 210, 14, 42);
    g.strokeRect(565, 202, 54, 10);

    // Golden Sun Pyramid near Node 3
    g.fillStyle(0xd97706, 1);
    g.fillTriangle(880, 310, 810, 420, 950, 420);
    g.fillStyle(0xb45309, 1);
    g.fillTriangle(880, 310, 880, 420, 950, 420);
    g.lineStyle(3, 0x78350f, 1);
    g.strokeTriangle(880, 310, 810, 420, 950, 420);

    // Parchment / Comic Map Border
    g.lineStyle(10, 0x543618, 1);
    g.strokeRect(5, 5, width - 10, height - 10);
    g.lineStyle(3, 0xd4a373, 1);
    g.strokeRect(12, 12, width - 24, height - 24);
  }

  private drawPalmTree(x: number, y: number): void {
    const g = this.add.graphics();
    // Trunk
    g.lineStyle(4, 0x78350f, 1);
    g.beginPath();
    g.moveTo(x, y + 16);
    g.lineTo(x, y);
    g.strokePath();

    // Palm fronds
    g.fillStyle(0x15803d, 1);
    g.fillCircle(x - 8, y - 4, 7);
    g.fillCircle(x + 8, y - 4, 7);
    g.fillCircle(x, y - 8, 8);
  }

  private renderPathConnections(): void {
    const g = this.add.graphics();
    g.lineStyle(4, 0x78350f, 0.7);

    for (let i = 0; i < this.stageNodes.length - 1; i++) {
      const n1 = this.stageNodes[i];
      const n2 = this.stageNodes[i + 1];

      // Draw dotted path curve
      const midX = (n1.x + n2.x) / 2;
      const midY = (n1.y + n2.y) / 2 + (i % 2 === 0 ? -40 : 40);

      const curve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(n1.x, n1.y),
        new Phaser.Math.Vector2(midX, midY),
        new Phaser.Math.Vector2(n2.x, n2.y)
      );

      const points = curve.getDistancePoints(18);
      points.forEach(p => {
        g.fillStyle(0x5c3d1e, 0.85);
        g.fillCircle(p.x, p.y, 4.5);
      });
    }
  }

  private renderStageNodes(): void {
    const save = SaveManager.getInstance();

    this.stageNodes.forEach((node) => {
      const levelData = save.getLevel(node.id);
      const isUnlocked = levelData.unlocked || node.id === 1;

      const container = this.add.container(node.x, node.y);

      // Node Foundation Base
      const base = this.add.graphics();
      base.fillStyle(isUnlocked ? 0xfef08a : 0x78716c, 0.9);
      base.fillCircle(0, 0, 24);
      base.lineStyle(3, isUnlocked ? 0xb45309 : 0x44403c, 1);
      base.strokeCircle(0, 0, 24);

      if (isUnlocked) {
        // Red Fluttering Banner Flag (Kingdom Rush Style)
        const flag = this.add.graphics();
        // Flagpole
        flag.fillStyle(0x451a03, 1);
        flag.fillRect(-2, -34, 4, 34);
        // Crimson Banner
        flag.fillStyle(0xdc2626, 1);
        flag.fillTriangle(2, -34, 28, -24, 2, -14);
        flag.lineStyle(1.5, 0x991b1b, 1);
        flag.strokeTriangle(2, -34, 28, -24, 2, -14);
        container.add(flag);

        // Stage Number
        const numText = this.add.text(0, 0, `${node.id}`, {
          fontFamily: '-apple-system, Inter, "Segoe UI", sans-serif',
          fontSize: '18px',
          fontStyle: '900',
          color: '#78350f'
        }).setOrigin(0.5);
        container.add(numText);

        // Stars below node
        let starsStr = '';
        for (let i = 0; i < 3; i++) {
          starsStr += i < levelData.stars ? '★' : '☆';
        }
        const starsText = this.add.text(0, 32, starsStr, {
          fontFamily: 'Inter, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#eab308',
          stroke: '#451a03',
          strokeThickness: 3
        }).setOrigin(0.5);
        container.add(starsText);

        // Glowing pulsing ring for next available stage
        if (levelData.stars === 0) {
          const pulse = this.add.circle(0, 0, 28, 0xfacc15, 0.4);
          this.tweens.add({
            targets: pulse,
            scale: 1.4,
            alpha: 0,
            duration: 1200,
            repeat: -1,
            ease: 'Sine.easeOut'
          });
          container.add(pulse);
        }
      } else {
        // Lock Icon
        const lock = this.add.text(0, 0, '🔒', {
          fontSize: '18px'
        }).setOrigin(0.5);
        container.add(lock);
      }

      container.add(base);
      container.setSize(60, 60);

      if (isUnlocked) {
        container.setInteractive({ useHandCursor: true });
        container.on('pointerover', () => {
          this.tweens.add({ targets: container, scale: 1.15, duration: 120 });
        });
        container.on('pointerout', () => {
          this.tweens.add({ targets: container, scale: 1.0, duration: 120 });
        });
        container.on('pointerdown', () => {
          SoundSynthesizer.getInstance().playUiClick();
          this.openStageCard(node);
        });
      }
    });
  }

  private openStageCard(node: StageNode): void {
    if (this.cardContainer) {
      this.cardContainer.destroy();
    }

    const { width, height } = this.scale;
    const save = SaveManager.getInstance();
    const levelData = save.getLevel(node.id);
    const map = MAPS.find(m => m.id === node.id) || MAPS[0];

    this.cardContainer = this.add.container(width / 2, height / 2).setDepth(30);

    // Modal Background overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.45);
    overlay.fillRect(-width / 2, -height / 2, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

    // Kingdom Rush Parchment Card
    const cardW = 380;
    const cardH = 310;
    const card = this.add.graphics();

    // Wood border frame
    card.fillStyle(0x451a03, 1);
    card.fillRoundedRect(-cardW / 2 - 8, -cardH / 2 - 8, cardW + 16, cardH + 16, 18);
    card.lineStyle(3, 0x92400e, 1);
    card.strokeRoundedRect(-cardW / 2 - 8, -cardH / 2 - 8, cardW + 16, cardH + 16, 18);

    // Parchment surface
    card.fillStyle(0xfef3c7, 1);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 14);

    // Top Title Ribbon Banner
    const banner = this.add.graphics();
    banner.fillStyle(0xb91c1c, 1);
    banner.fillRoundedRect(-140, -cardH / 2 - 16, 280, 36, 8);
    banner.lineStyle(2, 0x7f1d1d, 1);
    banner.strokeRoundedRect(-140, -cardH / 2 - 16, 280, 36, 8);

    const titleText = this.add.text(0, -cardH / 2 + 2, node.name.toUpperCase(), {
      fontFamily: '-apple-system, Inter, "Segoe UI", sans-serif',
      fontSize: '15px',
      fontStyle: '900',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);

    const regionText = this.add.text(0, -cardH / 2 + 38, `📍 ${node.region}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      fontStyle: '700',
      color: '#b45309'
    }).setOrigin(0.5);

    const descText = this.add.text(0, -cardH / 2 + 80, map.description, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      color: '#451a03',
      align: 'center',
      wordWrap: { width: 330 }
    }).setOrigin(0.5);

    // Stars display
    let starsStr = '';
    for (let i = 0; i < 3; i++) {
      starsStr += i < levelData.stars ? '★ ' : '☆ ';
    }
    const starText = this.add.text(0, -cardH / 2 + 135, starsStr, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '28px',
      color: '#eab308'
    }).setOrigin(0.5);

    const scoreText = this.add.text(0, -cardH / 2 + 175, `Bester Punktestand: ${levelData.highScore}`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#78350f'
    }).setOrigin(0.5);

    // "ZUM KAMPF ⚔️" Start Button
    const btnBattle = this.add.container(0, cardH / 2 - 45);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x16a34a, 1);
    btnBg.fillRoundedRect(-110, -22, 220, 44, 22);
    btnBg.lineStyle(2, 0x14532d, 1);
    btnBg.strokeRoundedRect(-110, -22, 220, 44, 22);

    const btnText = this.add.text(0, 0, 'ZUM KAMPF ⚔️', {
      fontFamily: '-apple-system, Inter, "Segoe UI", sans-serif',
      fontSize: '16px',
      fontStyle: '900',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);

    btnBattle.add([btnBg, btnText]);
    btnBattle.setSize(220, 44);
    btnBattle.setInteractive({ useHandCursor: true });

    btnBattle.on('pointerdown', () => {
      SoundSynthesizer.getInstance().playWaveHorn();
      this.scene.start('GameScene', { levelId: node.id });
    });

    // Close Button (Top right of card)
    const btnClose = this.add.text(cardW / 2 - 18, -cardH / 2 + 18, '✕', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '20px',
      fontStyle: '900',
      color: '#78350f'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnClose.on('pointerdown', () => {
      SoundSynthesizer.getInstance().playUiClick();
      if (this.cardContainer) {
        this.cardContainer.destroy();
        this.cardContainer = null;
      }
    });

    this.cardContainer.add([
      overlay,
      card,
      banner,
      titleText,
      regionText,
      descText,
      starText,
      scoreText,
      btnBattle,
      btnClose
    ]);

    // Animate modal pop
    this.cardContainer.setScale(0.8);
    this.tweens.add({
      targets: this.cardContainer,
      scale: 1,
      duration: 180,
      ease: 'Back.out'
    });
  }

  private renderTopCampaignBar(width: number): void {
    const save = SaveManager.getInstance();
    const totalStars = save.getTotalStars();

    const topBar = this.add.container(width / 2, 42);

    // Wooden Banner Plate
    const plateW = Math.min(520, width * 0.9);
    const bg = this.add.graphics();
    bg.fillStyle(0x451a03, 0.95);
    bg.fillRoundedRect(-plateW / 2, -22, plateW, 44, 22);
    bg.lineStyle(2, 0xd4a373, 1);
    bg.strokeRoundedRect(-plateW / 2, -22, plateW, 44, 22);

    // Title
    const title = this.add.text(-plateW / 2 + 25, 0, '👑 KAMPAGNE: AL-KHARID', {
      fontFamily: '-apple-system, Inter, "Segoe UI", sans-serif',
      fontSize: '14px',
      fontStyle: '900',
      color: '#fde047',
      letterSpacing: 1
    }).setOrigin(0, 0.5);

    // Stars Badge
    const starsBadge = this.add.text(plateW / 2 - 35, 0, `⭐ ${totalStars} / 9`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(1, 0.5);

    topBar.add([bg, title, starsBadge]);
  }
}
