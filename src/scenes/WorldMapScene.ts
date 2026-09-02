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
    { id: 1, x: 260, y: 360, name: 'Sonnental-Ruinen & Oase', region: "Al'Kazam Oasental" },
    { id: 2, x: 570, y: 350, name: 'Knochen-Canyon & Ruinen', region: 'Ruinen von Amun' },
    { id: 3, x: 800, y: 330, name: 'Goldene Sonnen-Pyramide', region: 'Kaelestria Königspyramide' }
  ];

  private selectedStageId: number = 1;

  constructor() {
    super('WorldMapScene');
  }

  public create(): void {
    const { width, height } = this.scale;

    // Hide gameplay HUD in World Map
    const hud = document.getElementById('hud-overlay');
    if (hud) hud.classList.add('hidden');

    // Show HTML World Map Touch Launcher UI
    const worldMapUi = document.getElementById('world-map-ui');
    if (worldMapUi) worldMapUi.classList.remove('hidden');

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

    // 3. Render Canvas Node Bases
    this.renderStageNodes();

    // 4. Bind HTML Mobile Touch Overlay Buttons
    this.initHtmlStageButtons();
  }

  private triggerHaptic(duration: number = 25): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }

  private initHtmlStageButtons(): void {
    const save = SaveManager.getInstance();
    const totalStars = save.getTotalStars();

    const totalStarsEl = document.getElementById('wm-total-stars');
    if (totalStarsEl) totalStarsEl.innerText = `⭐ ${totalStars} / 9`;

    for (let id = 1; id <= 3; id++) {
      const btn = document.getElementById(`pin-stage-1`.replace('1', `${id}`));
      const starsEl = document.getElementById(`pin-stars-1`.replace('1', `${id}`));
      const levelData = save.getLevel(id);
      const isUnlocked = levelData.unlocked || id === 1;

      if (starsEl) {
        let starsStr = '';
        for (let s = 0; s < 3; s++) {
          starsStr += s < levelData.stars ? '★' : '☆';
        }
        starsEl.innerText = starsStr;
      }

      if (btn) {
        if (!isUnlocked) {
          btn.classList.add('locked');
          btn.onclick = () => {
            this.triggerHaptic(60);
            SoundSynthesizer.getInstance().playError();
          };
        } else {
          btn.classList.remove('locked');
          btn.onclick = () => {
            this.triggerHaptic(30);
            SoundSynthesizer.getInstance().playUiClick();
            this.openHtmlStageBriefing(id);
          };
        }
      }
    }

    // Modal Close
    const modalClose = document.getElementById('modal-stage-close');
    if (modalClose) {
      modalClose.onclick = () => {
        this.triggerHaptic(15);
        SoundSynthesizer.getInstance().playUiClick();
        this.closeHtmlStageBriefing();
      };
    }

    // Modal Start Battle Button
    const btnBattle = document.getElementById('modal-btn-start-battle');
    if (btnBattle) {
      btnBattle.onclick = () => {
        this.triggerHaptic(40);
        SoundSynthesizer.getInstance().playWaveHorn();
        this.closeHtmlStageBriefing();
        this.startLevel(this.selectedStageId);
      };
    }
  }

  private openHtmlStageBriefing(stageId: number): void {
    this.selectedStageId = stageId;
    const save = SaveManager.getInstance();
    const levelData = save.getLevel(stageId);
    const map = MAPS.find(m => m.id === stageId) || MAPS[0];

    const modal = document.getElementById('stage-briefing-modal');
    const stageNum = document.getElementById('modal-stage-num');
    const stageName = document.getElementById('modal-stage-name');
    const stageRegion = document.getElementById('modal-stage-region');
    const stageDesc = document.getElementById('modal-stage-desc');
    const stageStars = document.getElementById('modal-stage-stars');
    const stageScore = document.getElementById('modal-stage-score');

    if (modal && stageNum && stageName && stageRegion && stageDesc && stageStars && stageScore) {
      stageNum.innerText = `STUFE ${stageId}`;
      stageName.innerText = map.name.toUpperCase();
      stageRegion.innerText = `📍 ${map.region}`;
      stageDesc.innerText = map.description;

      let starsStr = '';
      for (let s = 0; s < 3; s++) {
        starsStr += s < levelData.stars ? '★ ' : '☆ ';
      }
      stageStars.innerText = starsStr;
      stageScore.innerText = `Bester Punktestand: ${levelData.highScore}`;

      modal.classList.remove('hidden');
    }
  }

  private closeHtmlStageBriefing(): void {
    const modal = document.getElementById('stage-briefing-modal');
    if (modal) modal.classList.add('hidden');
  }

  public startLevel(levelId: number): void {
    const worldMapUi = document.getElementById('world-map-ui');
    if (worldMapUi) worldMapUi.classList.add('hidden');

    this.scene.start('GameScene', { levelId });
  }

  private renderPathConnections(): void {
    const g = this.add.graphics().setDepth(2);

    for (let i = 0; i < this.stageNodes.length - 1; i++) {
      const n1 = this.stageNodes[i];
      const n2 = this.stageNodes[i + 1];

      const midX = (n1.x + n2.x) / 2;
      const midY = (n1.y + n2.y) / 2 - 20;

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

      // Node Base Graphic
      const base = this.add.graphics();
      base.fillStyle(isUnlocked ? 0xfef08a : 0x78716c, 0.95);
      base.fillCircle(0, 0, 26);
      base.lineStyle(3.5, isUnlocked ? 0xb45309 : 0x44403c, 1);
      base.strokeCircle(0, 0, 26);

      if (isUnlocked) {
        // Red Banner Flag
        const flag = this.add.graphics();
        flag.fillStyle(0x451a03, 1);
        flag.fillRect(-2, -38, 4, 38);
        flag.fillStyle(0xdc2626, 1);
        flag.fillTriangle(2, -38, 32, -26, 2, -14);
        flag.lineStyle(1.5, 0x991b1b, 1);
        flag.strokeTriangle(2, -38, 32, -26, 2, -14);
        container.add(flag);

        const numText = this.add.text(0, 0, `${node.id}`, {
          fontFamily: '-apple-system, Inter, "Segoe UI", sans-serif',
          fontSize: '20px',
          fontStyle: '900',
          color: '#78350f'
        }).setOrigin(0.5);
        container.add(numText);

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
      } else {
        const lock = this.add.text(0, 0, '🔒', {
          fontSize: '20px'
        }).setOrigin(0.5);
        container.add(lock);
      }

      container.add(base);

      if (isUnlocked) {
        // 100px diameter touch area
        container.setInteractive(new Phaser.Geom.Circle(0, 0, 50), Phaser.Geom.Circle.Contains);
        container.on('pointerdown', () => {
          this.triggerHaptic(25);
          SoundSynthesizer.getInstance().playUiClick();
          this.openHtmlStageBriefing(node.id);
        });
      }
    });
  }
}
