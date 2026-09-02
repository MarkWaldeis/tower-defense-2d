import Phaser from 'phaser';
import { MAPS } from '../config/GameConfig';
import { SaveManager } from '../systems/SaveManager';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  public create(): void {
    const { width, height } = this.scale;
    const save = SaveManager.getInstance();

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x060911, 0x060911, 0x0c1427, 0x0c1427, 1);
    bg.fillRect(0, 0, width, height);

    // Header
    this.add.text(width / 2, 45, 'SEKTOR-AUSWAHL', {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '26px',
      fontStyle: '900',
      color: '#ffffff',
      stroke: '#00f2ff',
      strokeThickness: 2,
      letterSpacing: 2
    }).setOrigin(0.5);

    // Level Cards List
    const startY = 110;
    const cardGap = 130;

    MAPS.forEach((map, index) => {
      const y = startY + index * cardGap;
      const levelData = save.getLevel(map.id);
      const isUnlocked = levelData.unlocked || map.id === 1;

      this.createLevelCard(width / 2, y, map, isUnlocked, levelData.stars, levelData.highScore);
    });

    // Back Button
    this.createBackButton(width / 2, height - 40);
  }

  private createLevelCard(
    x: number,
    y: number,
    map: (typeof MAPS)[0],
    unlocked: boolean,
    stars: number,
    highScore: number
  ): void {
    const cardWidth = Math.min(480, this.scale.width * 0.88);
    const cardHeight = 105;
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(unlocked ? 0x1e293b : 0x0f172a, 0.8);
    bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);
    bg.lineStyle(1.5, unlocked ? 0x00f2ff : 0x334155, unlocked ? 0.6 : 0.3);
    bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 16);

    // Icon / Badge
    const iconText = this.add.text(-cardWidth / 2 + 35, 0, unlocked ? '🛡️' : '🔒', {
      fontSize: '28px'
    }).setOrigin(0.5);

    // Title
    const title = this.add.text(-cardWidth / 2 + 75, -24, map.name, {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '16px',
      fontStyle: '800',
      color: unlocked ? '#ffffff' : '#64748b'
    });

    // Subtitle
    const sub = this.add.text(-cardWidth / 2 + 75, 2, map.subtitle, {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '11px',
      color: '#94a3b8'
    });

    // Stats / Stars
    let starsStr = '';
    for (let i = 0; i < 3; i++) {
      starsStr += i < stars ? '★ ' : '☆ ';
    }

    const starText = this.add.text(-cardWidth / 2 + 75, 24, starsStr, {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '16px',
      color: '#ffd60a'
    });

    const scoreText = this.add.text(cardWidth / 2 - 20, 24, `Rekord: ${highScore}`, {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '11px',
      color: '#38bdf8'
    }).setOrigin(1, 0);

    container.add([bg, iconText, title, sub, starText, scoreText]);

    if (unlocked) {
      container.setSize(cardWidth, cardHeight);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        this.tweens.add({ targets: container, scale: 1.03, duration: 120 });
      });

      container.on('pointerout', () => {
        this.tweens.add({ targets: container, scale: 1.0, duration: 120 });
      });

      container.on('pointerdown', () => {
        SoundSynthesizer.getInstance().playUiClick();
        this.scene.start('GameScene', { levelId: map.id });
      });
    }
  }

  private createBackButton(x: number, y: number): void {
    const btn = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0x1e293b, 0.7);
    bg.fillRoundedRect(-70, -18, 140, 36, 18);
    bg.lineStyle(1, 0x64748b, 0.5);
    bg.strokeRoundedRect(-70, -18, 140, 36, 18);

    const txt = this.add.text(0, 0, '← ZURÜCK', {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '13px',
      fontStyle: '700',
      color: '#ffffff'
    }).setOrigin(0.5);

    btn.add([bg, txt]);
    btn.setSize(140, 36);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      SoundSynthesizer.getInstance().playUiClick();
      this.scene.start('MainMenuScene');
    });
  }
}
