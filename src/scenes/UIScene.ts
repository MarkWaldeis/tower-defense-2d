import Phaser from 'phaser';
import { GameScene } from './GameScene';
import { TowerType, TargetingMode } from '../types/game';
import { TOWERS_CONFIG } from '../config/GameConfig';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import { Tower } from '../entities/towers/Tower';

export class UIScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private selectedSpotIndex: number | null = null;
  private selectedTower: Tower | null = null;

  constructor() {
    super('UIScene');
  }

  public create(data: { gameScene: GameScene }): void {
    this.gameScene = data.gameScene;
    this.initHUD();
  }

  private initHUD(): void {
    const hud = document.getElementById('hud-overlay');
    if (hud) hud.classList.remove('hidden');

    this.bindTopBarEvents();
    this.bindRadialBuildEvents();
    this.bindInspectCardEvents();
    this.bindSpellEvents();
    this.bindWaveButtonEvents();
    this.bindModalEvents();
  }

  private bindTopBarEvents(): void {
    const btnSpeed = document.getElementById('btn-speed');
    const btnSpeedLabel = document.getElementById('btn-speed-label');
    const btnPause = document.getElementById('btn-pause');
    const btnSound = document.getElementById('btn-sound');
    const btnSoundIcon = document.getElementById('btn-sound-icon');
    const btnBackMap = document.getElementById('btn-back-map');

    if (btnSpeed && btnSpeedLabel) {
      btnSpeed.onclick = () => {
        SoundSynthesizer.getInstance().playUiClick();
        const speeds = [1, 2, 3];
        const nextIdx = (speeds.indexOf(this.gameScene.gameSpeed) + 1) % speeds.length;
        this.gameScene.setGameSpeed(speeds[nextIdx]);
        btnSpeedLabel.innerText = `${speeds[nextIdx]}x`;
      };
    }

    if (btnPause) {
      btnPause.onclick = () => {
        SoundSynthesizer.getInstance().playUiClick();
        const isPaused = this.gameScene.togglePause();
        const icon = document.getElementById('btn-pause-icon');
        if (icon) icon.innerText = isPaused ? '▶️' : '⏸️';
      };
    }

    if (btnSound && btnSoundIcon) {
      btnSound.onclick = () => {
        const enabled = SoundSynthesizer.getInstance().toggle();
        btnSoundIcon.innerText = enabled ? '🔊' : '🔇';
      };
    }

    if (btnBackMap) {
      btnBackMap.onclick = () => {
        SoundSynthesizer.getInstance().playUiClick();
        const hud = document.getElementById('hud-overlay');
        if (hud) hud.classList.add('hidden');
        this.gameScene.scene.stop('GameScene');
        this.scene.stop('UIScene');
        this.gameScene.scene.start('WorldMapScene');
      };
    }
  }

  private bindRadialBuildEvents(): void {
    const cards = document.querySelectorAll('.tower-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement);
        const type = target.getAttribute('data-type') as TowerType;
        if (type && this.selectedSpotIndex !== null) {
          const success = this.gameScene.buildTowerOnSpot(this.selectedSpotIndex, type);
          if (success) {
            this.closeBuildMenu();
          }
        }
      });
    });
  }

  public openBuildMenuForSpot(spotIndex: number, screenX: number, screenY: number): void {
    this.selectedSpotIndex = spotIndex;
    this.closeInspectCard();

    const menu = document.getElementById('radial-build-menu');
    if (!menu) return;

    // Position menu near the spot or centered
    menu.style.left = `${Math.min(Math.max(screenX, 180), window.innerWidth - 180)}px`;
    menu.style.top = `${Math.min(Math.max(screenY, 120), window.innerHeight - 120)}px`;
    menu.classList.remove('hidden');

    this.updateBuildMenuCards();
  }

  public closeBuildMenu(): void {
    this.selectedSpotIndex = null;
    const menu = document.getElementById('radial-build-menu');
    if (menu) menu.classList.add('hidden');
    this.gameScene.clearRange();
  }

  private updateBuildMenuCards(): void {
    const gold = this.gameScene.gold;
    const cards = document.querySelectorAll('.tower-card');
    cards.forEach(card => {
      const type = (card as HTMLElement).getAttribute('data-type') as TowerType;
      if (type) {
        const cost = TOWERS_CONFIG[type].cost;
        if (gold < cost) {
          card.classList.add('disabled');
        } else {
          card.classList.remove('disabled');
        }
      }
    });
  }

  private bindSpellEvents(): void {
    const btnLightning = document.getElementById('btn-spell-lightning');
    if (btnLightning) {
      btnLightning.onclick = () => {
        SoundSynthesizer.getInstance().playUiClick();
        if (this.gameScene.activeSpell === 'LIGHTNING') {
          this.clearSpellSelection();
        } else {
          this.gameScene.activeSpell = 'LIGHTNING';
          btnLightning.classList.add('active');
        }
      };
    }
  }

  public clearSpellSelection(): void {
    this.gameScene.activeSpell = null;
    const btnLightning = document.getElementById('btn-spell-lightning');
    if (btnLightning) btnLightning.classList.remove('active');
  }

  private bindInspectCardEvents(): void {
    const closeBtn = document.getElementById('btn-close-inspect');
    const btnUpg = document.getElementById('btn-upgrade-tower');
    const btnSell = document.getElementById('btn-sell-tower');

    if (closeBtn) {
      closeBtn.onclick = () => {
        SoundSynthesizer.getInstance().playUiClick();
        this.closeInspectCard();
      };
    }

    if (btnUpg) {
      btnUpg.onclick = () => {
        if (!this.selectedTower) return;
        const cost = this.selectedTower.getUpgradeCost();
        if (this.gameScene.gold >= cost) {
          this.gameScene.spendGold(cost);
          this.selectedTower.upgrade();
          this.updateInspectCardStats();
          this.gameScene.showRange(this.selectedTower.x, this.selectedTower.y, this.selectedTower.currentRange);
        } else {
          SoundSynthesizer.getInstance().playError();
        }
      };
    }

    if (btnSell) {
      btnSell.onclick = () => {
        if (!this.selectedTower) return;
        const sellVal = this.selectedTower.getSellValue();
        this.gameScene.addGold(sellVal);
        SoundSynthesizer.getInstance().playCoin();
        this.gameScene.removeTower(this.selectedTower);
        this.closeInspectCard();
      };
    }

    const targetBtns = document.querySelectorAll('.target-btn');
    targetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement).getAttribute('data-target') as TargetingMode;
        if (target && this.selectedTower) {
          SoundSynthesizer.getInstance().playUiClick();
          this.selectedTower.targetingMode = target;
          targetBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
    });
  }

  public openInspectCard(tower: Tower): void {
    this.selectedTower = tower;
    this.closeBuildMenu();

    const card = document.getElementById('tower-inspect-card');
    if (!card) return;

    card.classList.remove('hidden');
    this.updateInspectCardStats();
  }

  public closeInspectCard(): void {
    this.selectedTower = null;
    const card = document.getElementById('tower-inspect-card');
    if (card) card.classList.add('hidden');
    this.gameScene.clearRange();
  }

  private updateInspectCardStats(): void {
    if (!this.selectedTower) return;
    const t = this.selectedTower;

    const avatar = document.getElementById('inspect-avatar');
    const name = document.getElementById('inspect-name');
    const lvl = document.getElementById('inspect-level');
    const dmg = document.getElementById('inspect-dmg');
    const range = document.getElementById('inspect-range');
    const firerate = document.getElementById('inspect-firerate');
    const special = document.getElementById('inspect-special');
    const upgCost = document.getElementById('inspect-upgrade-cost');
    const sellVal = document.getElementById('inspect-sell-value');
    const btnUpg = document.getElementById('btn-upgrade-tower') as HTMLButtonElement;

    if (avatar) avatar.innerText = t.baseStats.icon;
    if (name) name.innerText = t.baseStats.name;
    if (lvl) lvl.innerText = `STUFE ${t.level} • ${t.level === 1 ? 'BASIC' : t.level === 2 ? 'VERSTÄRKT' : 'MEISTER'}`;
    if (dmg) dmg.innerText = `${t.currentDamage}`;
    if (range) range.innerText = `${t.currentRange}`;
    if (firerate) firerate.innerText = `${t.currentFireRate.toFixed(1)}/s`;
    if (special) special.innerText = t.baseStats.special;

    if (t.level >= 3) {
      if (upgCost) upgCost.innerText = 'MAX STUFE';
      if (btnUpg) btnUpg.disabled = true;
    } else {
      const cost = t.getUpgradeCost();
      if (upgCost) upgCost.innerText = `🪙 ${cost}`;
      if (btnUpg) btnUpg.disabled = this.gameScene.gold < cost;
    }

    if (sellVal) sellVal.innerText = `+🪙 ${t.getSellValue()}`;

    document.querySelectorAll('.target-btn').forEach(btn => {
      const mode = btn.getAttribute('data-target');
      if (mode === t.targetingMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  private bindWaveButtonEvents(): void {
    const btnCallWave = document.getElementById('btn-call-wave');
    if (btnCallWave) {
      btnCallWave.onclick = () => {
        this.closeBuildMenu();
        this.closeInspectCard();
        this.gameScene.startNextWave();
      };
    }
  }

  public setWaveButtonState(inProgress: boolean): void {
    const btnText = document.getElementById('btn-call-wave-text');
    if (btnText) {
      btnText.innerText = inProgress ? 'KAMPF LÄUFT...' : 'NÄCHSTE WELLE';
    }
  }

  public showWaveBanner(_waveNumber: number, _isBoss: boolean): void {
    // Wave announcement
  }

  public updateStats(gold: number, lives: number, wave: number, totalWaves: number, score: number): void {
    const goldEl = document.getElementById('hud-gold-text');
    const livesEl = document.getElementById('hud-lives-text');
    const waveEl = document.getElementById('hud-wave-text');
    const scoreEl = document.getElementById('hud-score-text');

    if (goldEl) goldEl.innerText = `${gold}`;
    if (livesEl) livesEl.innerText = `${lives}`;
    if (waveEl) waveEl.innerText = `${wave} / ${totalWaves}`;
    if (scoreEl) scoreEl.innerText = `${score}`;

    this.updateBuildMenuCards();
    if (this.selectedTower) {
      this.updateInspectCardStats();
    }
  }

  private bindModalEvents(): void {
    const btnRestart = document.getElementById('btn-modal-restart');
    const btnMenu = document.getElementById('btn-modal-menu');

    if (btnRestart) {
      btnRestart.onclick = () => {
        SoundSynthesizer.getInstance().playUiClick();
        this.hideModal();
        this.gameScene.restartLevel();
      };
    }

    if (btnMenu) {
      btnMenu.onclick = () => {
        SoundSynthesizer.getInstance().playUiClick();
        this.hideModal();
        const hud = document.getElementById('hud-overlay');
        if (hud) hud.classList.add('hidden');
        this.gameScene.scene.stop('GameScene');
        this.scene.stop('UIScene');
        this.gameScene.scene.start('WorldMapScene');
      };
    }
  }

  public showVictoryModal(score: number, _kills: number, lives: number, totalLives: number): void {
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const stars = document.getElementById('modal-stars');
    const fScore = document.getElementById('modal-final-score');

    if (modal && title && desc && stars && fScore) {
      title.innerText = 'SIEG! OASE GESICHERT';
      desc.innerText = 'Alle feindlichen Sand-Goblins und Golems wurden erfolgreich besiegt!';
      const starCount = lives >= totalLives ? 3 : lives >= totalLives * 0.5 ? 2 : 1;
      stars.innerText = starCount === 3 ? '★★★' : starCount === 2 ? '★★☆' : '★☆☆';
      fScore.innerText = `${score}`;
      modal.classList.remove('hidden');
    }
  }

  public showDefeatModal(score: number, _kills: number, wave: number): void {
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const stars = document.getElementById('modal-stars');
    const fScore = document.getElementById('modal-final-score');

    if (modal && title && desc && stars && fScore) {
      title.innerText = 'NIEDERLAGE!';
      desc.innerText = `Die Ruinen wurden in Welle ${wave} überrannt.`;
      stars.innerText = '☆☆☆';
      fScore.innerText = `${score}`;
      modal.classList.remove('hidden');
    }
  }

  public hideModal(): void {
    const modal = document.getElementById('game-modal');
    if (modal) modal.classList.add('hidden');
  }
}
