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
    { id: 1, x: 240, y: 390, name: 'Sonnental-Ruinen & Oase', region: "Al'Kazam Oasental" },
    { id: 2, x: 560, y: 380, name: 'Knochen-Canyon & Ruinen', region: 'Ruinen von Amun' },
    { id: 3, x: 810, y: 350, name: 'Goldene Sonnen-Pyramide', region: 'Kaelestria Königspyramide' }
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
    const backdrop = document.getElementById('menu-backdrop');
    if (backdrop) backdrop.classList.add('hidden');

    // 1. Render AAA Hand-Drawn Campaign Background Map
    if (this.textures.exists('map_world_campaign')) {
      const bg = this.add.image(width / 2, height / 2, 'map_world_campaign');
      bg.setDisplaySize(width, height);
      bg.setDepth(1);
    } else {
      const g = this.add.graphics();
      g.fillGradientStyle(0xdfba81, 0xdfba81, 0xc89858, 0xc89858, 1);
      g.fillRect(0, 0, width, height);
    }

    // 2. Render Stage Connecting Path Dots
    this.renderPathConnections();

    // 3. Render Stage Flags & Interactive Nodes
    this.renderStageNodes();

    // 4. Render Top Campaign Bar
    this.renderTopCampaignBar(width);
  }

  private triggerHaptic(duration: number = 25): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }

  private renderPathConnections(): void {
    const g = this.add.graphics().setDepth(2);

    for (let i = 0; i < this.stageNodes.length - 1; i++) {
      const n1 = this.stageNodes[i];
      const n2 = this.stageNodes[i + 1];

      const midX = (n1.x + n2.x) / 2;
      const midY = (n1.y + n2.y) / 2 - 25;

      const curve = new Phaser.Curves.QuadraticBezier(
        new Phaser.Math.Vector2(n1.x, n1.y),
        new Phaser.Math.Vector2(midX, midY),
        new Phaser.Math.Vector2(n2.x, n2.y)
      );

      const points = curve.getDistancePoints(16);
      points.forEach(p => {
        g.fillStyle(0x78350f, 0.9);
        g.fillCircle(p.x, p.y, 4.5);
        g.lineStyle(1, 0xfef08a, 0.6);
        g.strokeCircle(p.x, p.y, 4.5);
      });
    }
  }

  private renderStageNodes(): void {
    const save = SaveManager.getInstance();

    this.stageNodes.forEach((node) => {
      const levelData = save.getLevel(node.id);
      const isUnlocked = levelData.unlocked || node.id === 1;

      const container = this.add.container(node.x, node.y).setDepth(5);

      // Node Foundation Base
      const base = this.add.graphics();
      base.fillStyle(isUnlocked ? 0xfef08a : 0x78716c, 0.95);
      base.fillCircle(0, 0, 26);
      base.lineStyle(3.5, isUnlocked ? 0xb45309 : 0x44403c, 1);
      base.strokeCircle(0, 0, 26);
      container.add(base);

      if (isUnlocked) {
        // Red Kingdom Rush Banner Flag
        const flag = this.add.graphics();
        flag.fillStyle(0x451a03, 1);
        flag.fillRect(-2, -38, 4, 38);
        flag.fillStyle(0xdc2626, 1);
        flag.fillTriangle(2, -38, 32, -26, 2, -14);
        flag.lineStyle(1.5, 0x991b1b, 1);
        flag.strokeTriangle(2, -38, 32, -26, 2, -14);
        container.add(flag);

        // Stage Number
        const numText = this.add.text(0, 0, `${node.id}`, {
          fontFamily: '-apple-system, Inter, "Segoe UI", sans-serif',
          fontSize: '20px',
          fontStyle: '900',
          color: '#78350f'
        }).setOrigin(0.5);
        container.add(numText);

        // Stars below node
        let starsStr = '';
        for (let i = 0; i < 3; i++) {
          starsStr += i < levelData.stars ? '★' : '☆';
        }
        const starsText = this.add.text(0, 36, starsStr, {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#eab308',
          stroke: '#451a03',
          strokeThickness: 3
        }).setOrigin(0.5);
        container.add(starsText);

        // Pulsing glowing ring for current stage
        const pulse = this.add.circle(0, 0, 32, 0xfacc15, 0.5);
        this.tweens.add({
          targets: pulse,
          scale: 1.4,
          alpha: 0,
          duration: 1200,
          repeat: -1,
          ease: 'Sine.easeOut'
        });
        container.add(pulse);

        // Dedicated 110px diameter touch hitZone for instant 0ms touch response
        const hitZone = this.add.circle(node.x, node.y, 55, 0x000000, 0)
          .setInteractive({ useHandCursor: true })
          .setDepth(20);

        hitZone.on('pointerover', () => {
          this.tweens.add({ targets: container, scale: 1.15, duration: 120 });
        });
        hitZone.on('pointerout', () => {
          this.tweens.add({ targets: container, scale: 1.0, duration: 120 });
        });
        hitZone.on('pointerdown', () => {
          this.triggerHaptic(30);
          SoundSynthesizer.getInstance().playUiClick();
          this.openStageCard(node);
        });
      } else {
        const lock = this.add.text(0, 0, '🔒', {
          fontSize: '20px'
        }).setOrigin(0.5);
        container.add(lock);
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

    // Backdrop
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(-width / 2, -height / 2, width, height);
    overlay.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
    overlay.on('pointerdown', () => {
      this.triggerHaptic(15);
      if (this.cardContainer) {
        this.cardContainer.destroy();
        this.cardContainer = null;
      }
    });

    const cardW = 380;
    const cardH = 310;
    const card = this.add.graphics();

    // Wood Border
    card.fillStyle(0x451a03, 1);
    card.fillRoundedRect(-cardW / 2 - 8, -cardH / 2 - 8, cardW + 16, cardH + 16, 20);
    card.lineStyle(3, 0x92400e, 1);
    card.strokeRoundedRect(-cardW / 2 - 8, -cardH / 2 - 8, cardW + 16, cardH + 16, 20);

    // Parchment Body
    card.fillStyle(0xfef3c7, 1);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 16);

    // Red Ribbon Banner
    const banner = this.add.graphics();
    banner.fillStyle(0xb91c1c, 1);
    banner.fillRoundedRect(-140, -cardH / 2 - 16, 280, 36, 8);
    banner.lineStyle(2, 0x7f1d1d, 1);
    banner.strokeRoundedRect(-140, -cardH / 2 - 16, 280, 36, 8);

    const titleText = this.add.text(0, -cardH / 2 + 2, node.name.toUpperCase(), {
      fontFamily: '-apple-system, Inter, "Segoe UI", sans-serif',
      fontSize: '14px',
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

    const descText = this.add.text(0, -cardH / 2 + 82, map.description, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      color: '#451a03',
      align: 'center',
      wordWrap: { width: 330 }
    }).setOrigin(0.5);

    let starsStr = '';
    for (let i = 0; i < 3; i++) {
      starsStr += i < levelData.stars ? '★ ' : '☆ ';
    }
    const starText = this.add.text(0, -cardH / 2 + 138, starsStr, {
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

    // Battle Button (Giant 240x52 touch target)
    const btnBattle = this.add.container(0, cardH / 2 - 45);
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x16a34a, 1);
    btnBg.fillRoundedRect(-120, -26, 240, 52, 26);
    btnBg.lineStyle(2.5, 0x14532d, 1);
    btnBg.strokeRoundedRect(-120, -26, 240, 52, 26);

    const btnText = this.add.text(0, 0, '⚔️ ZUM KAMPF ⚔️', {
      fontFamily: '-apple-system, Inter, "Segoe UI", sans-serif',
      fontSize: '17px',
      fontStyle: '900',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);

    const btnHit = this.add.rectangle(0, 0, 240, 52, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    btnHit.on('pointerdown', () => {
      this.triggerHaptic(40);
      SoundSynthesizer.getInstance().playWaveHorn();
      this.scene.start('GameScene', { levelId: node.id });
    });

    btnBattle.add([btnBg, btnText, btnHit]);

    // Close button
    const btnCloseText = this.add.text(cardW / 2 - 18, -cardH / 2 + 18, '✕', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '22px',
      fontStyle: '900',
      color: '#78350f'
    }).setOrigin(0.5);

    const closeHit = this.add.circle(cardW / 2 - 18, -cardH / 2 + 18, 28, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    closeHit.on('pointerdown', () => {
      this.triggerHaptic(15);
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
      btnCloseText,
      closeHit
    ]);

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

    const topBar = this.add.container(width / 2, 34).setDepth(20);

    const plateW = Math.min(480, width * 0.85);
    const bg = this.add.graphics();
    bg.fillStyle(0x451a03, 0.95);
    bg.fillRoundedRect(-plateW / 2, -18, plateW, 36, 18);
    bg.lineStyle(2, 0xd4a373, 1);
    bg.strokeRoundedRect(-plateW / 2, -18, plateW, 36, 18);

    const title = this.add.text(-plateW / 2 + 18, 0, '👑 KÖNIGREICH KAELESTRIA', {
      fontFamily: '-apple-system, Inter, "Segoe UI", sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#fde047',
      letterSpacing: 1
    }).setOrigin(0, 0.5);

    const starsBadge = this.add.text(plateW / 2 - 20, 0, `⭐ ${totalStars} / 9`, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(1, 0.5);

    topBar.add([bg, title, starsBadge]);
  }
}
