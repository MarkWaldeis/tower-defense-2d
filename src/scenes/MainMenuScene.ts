import Phaser from 'phaser';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import { SaveManager } from '../systems/SaveManager';

export class MainMenuScene extends Phaser.Scene {
  private bgStars: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super('MainMenuScene');
  }

  public create(): void {
    const { width, height } = this.scale;

    // Ensure HUD is hidden in menu
    const hud = document.getElementById('hud-overlay');
    if (hud) hud.classList.add('hidden');

    // 1. Animated Cyber Grid & Star Background
    this.createBackground(width, height);

    // 2. Title Card with Glow
    const titleContainer = this.add.container(width / 2, height * 0.28);

    const titleGlow = this.add.text(0, 0, 'TOWER DEFENSE 2D', {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: width < 600 ? '28px' : '44px',
      fontStyle: '900',
      color: '#00f2ff',
      align: 'center'
    }).setOrigin(0.5);

    const titleText = this.add.text(0, 0, 'TOWER DEFENSE 2D', {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: width < 600 ? '28px' : '44px',
      fontStyle: '900',
      color: '#ffffff',
      stroke: '#00f2ff',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, 36, 'MOBILE TACTICAL WARFARE • FSM ENGINE', {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: width < 600 ? '11px' : '14px',
      fontStyle: '700',
      color: '#38bdf8',
      letterSpacing: 3
    }).setOrigin(0.5);

    titleContainer.add([titleGlow, titleText, subtitle]);

    // Floating breathing tween
    this.tweens.add({
      targets: titleContainer,
      y: height * 0.28 + 6,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3. Apple Glass Menu Buttons
    const btnStartY = height * 0.52;
    const btnGap = 58;

    this.createMenuButton(width / 2, btnStartY, 'KAMPAGNE STARTEN', '#00f2ff', () => {
      SoundSynthesizer.getInstance().playUiClick();
      this.scene.start('GameScene', { levelId: 1 });
    });

    this.createMenuButton(width / 2, btnStartY + btnGap, 'MISSION WÄHLEN', '#38bdf8', () => {
      SoundSynthesizer.getInstance().playUiClick();
      this.scene.start('LevelSelectScene');
    });

    const soundEnabled = SaveManager.getInstance().getSoundEnabled();
    this.createMenuButton(
      width / 2,
      btnStartY + btnGap * 2,
      `AUDIO: ${soundEnabled ? 'AN 🔊' : 'AUS 🔇'}`,
      '#94a3b8',
      (btnText) => {
        const enabled = SoundSynthesizer.getInstance().toggle();
        SaveManager.getInstance().setSoundEnabled(enabled);
        btnText.setText(`AUDIO: ${enabled ? 'AN 🔊' : 'AUS 🔇'}`);
      }
    );

    // Footer info
    this.add.text(width / 2, height - 25, 'V1.0.0 • POWERED BY PHASER 3 & APPLE LIQUID GLASS UI', {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '10px',
      color: '#64748b'
    }).setOrigin(0.5);
  }

  private createBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x060911, 0x060911, 0x0c1427, 0x0c1427, 1);
    bg.fillRect(0, 0, width, height);

    // Moving particles
    for (let i = 0; i < 40; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(1, 2.5),
        0x00f2ff,
        Phaser.Math.FloatBetween(0.2, 0.7)
      );
      this.bgStars.push(star);
    }
  }

  public update(_time: number, delta: number): void {
    const { height } = this.scale;
    this.bgStars.forEach(star => {
      star.y -= 0.3 * (delta / 16);
      if (star.y < 0) star.y = height;
    });
  }

  private createMenuButton(
    x: number,
    y: number,
    text: string,
    accentColor: string,
    onClick: (textObj: Phaser.GameObjects.Text) => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const btnWidth = Math.min(280, this.scale.width * 0.75);
    const btnHeight = 44;

    const bg = this.add.graphics();
    bg.fillStyle(0x1e293b, 0.75);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 22);
    bg.lineStyle(1.5, Phaser.Display.Color.HexStringToColor(accentColor).color, 0.5);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 22);

    const btnText = this.add.text(0, 0, text, {
      fontFamily: '-apple-system, Inter, sans-serif',
      fontSize: '14px',
      fontStyle: '800',
      color: '#ffffff',
      letterSpacing: 1
    }).setOrigin(0.5);

    container.add([bg, btnText]);
    container.setSize(btnWidth, btnHeight);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scale: 1.05,
        duration: 150,
        ease: 'Quad.out'
      });
    });

    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: 1.0,
        duration: 150,
        ease: 'Quad.out'
      });
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scale: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: () => onClick(btnText)
      });
    });

    return container;
  }
}
