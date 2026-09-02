import Phaser from 'phaser';
import { GameScene } from './GameScene';
import { TowerType, TargetingMode } from '../types/game';
import { TOWERS_CONFIG } from '../config/GameConfig';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import { Tower } from '../entities/towers/Tower';
import { bindTap } from '../utils/domInput';

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

  private triggerHaptic(duration: number = 20): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // ignore on unsupported devices
      }
    }
  }

  private initHUD(): void {
    const hud = document.getElementById('hud-overlay');
    if (hud) hud.classList.remove('hidden');

    this.bindBackdropEvents();
    this.bindTopBarEvents();
    this.bindBuildDockEvents();
    this.bindInspectCardEvents();
    this.bindSpellEvents();
    this.bindWaveButtonEvents();
    this.bindModalEvents();
  }

  private bindBackdropEvents(): void {
    const backdrop = document.getElementById('menu-backdrop');
    if (backdrop) {
      bindTap(backdrop, () => {
        this.closeBuildMenu();
        this.closeInspectCard();
      });
    }
  }

  private bindTopBarEvents(): void {
    const btnSpeed = document.getElementById('btn-speed');
    const btnSpeedLabel = document.getElementById('btn-speed-label');
    const btnPause = document.getElementById('btn-pause');
    const btnSound = document.getElementById('btn-sound');
    const btnSoundIcon = document.getElementById('btn-sound-icon');
    const btnBackMap = document.getElementById('btn-back-map');

    if (btnSpeed && btnSpeedLabel) {
      bindTap(btnSpeed, () => {
        this.triggerHaptic(15);
        SoundSynthesizer.getInstance().playUiClick();
        const speeds = [1, 2, 3];
        const nextIdx = (speeds.indexOf(this.gameScene.gameSpeed) + 1) % speeds.length;
        this.gameScene.setGameSpeed(speeds[nextIdx]);
        btnSpeedLabel.innerText = `${speeds[nextIdx]}x`;
      });
    }

    if (btnPause) {
      bindTap(btnPause, () => {
        this.triggerHaptic(20);
        SoundSynthesizer.getInstance().playUiClick();
        const isPaused = this.gameScene.togglePause();
        const icon = document.getElementById('btn-pause-icon');
        if (icon) icon.innerText = isPaused ? '▶️' : '⏸️';
      });
    }

    if (btnSound && btnSoundIcon) {
      bindTap(btnSound, () => {
        this.triggerHaptic(15);
        const enabled = SoundSynthesizer.getInstance().toggle();
        btnSoundIcon.innerText = enabled ? '🔊' : '🔇';
      });
    }

    if (btnBackMap) {
      bindTap(btnBackMap, () => {
        this.triggerHaptic(30);
        SoundSynthesizer.getInstance().playUiClick();
        const hud = document.getElementById('hud-overlay');
        if (hud) hud.classList.add('hidden');
        this.closeBuildMenu();
        this.closeInspectCard();
        this.gameScene.scene.stop('GameScene');
        this.scene.stop('UIScene');
        this.gameScene.scene.start('WorldMapScene');
      });
    }
  }

  private bindBuildDockEvents(): void {
    const cards = document.querySelectorAll('.tower-card');
    cards.forEach(card => {
      bindTap(card as HTMLElement, (e) => {
        const target = (e.currentTarget as HTMLElement);
        if (target.classList.contains('disabled')) return;
        const type = target.getAttribute('data-type') as TowerType;
        if (type && this.selectedSpotIndex !== null) {
          this.triggerHaptic(35);
          const success = this.gameScene.buildTowerOnSpot(this.selectedSpotIndex, type);
          if (success) {
            this.closeBuildMenu();
          }
        }
      });
    });

    const closeDock = document.getElementById('btn-close-dock');
    if (closeDock) {
      bindTap(closeDock, () => {
        this.triggerHaptic(15);
        SoundSynthesizer.getInstance().playUiClick();
        this.closeBuildMenu();
      });
    }
  }

  public openBuildMenuForSpot(spotIndex: number): void {
    this.selectedSpotIndex = spotIndex;
    this.closeInspectCard();

    const dock = document.getElementById('build-dock-menu');
    const backdrop = document.getElementById('menu-backdrop');
    if (!dock) return;

    dock.classList.remove('hidden');
    if (backdrop) backdrop.classList.remove('hidden');
    this.updateBuildMenuCards();
  }

  public closeBuildMenu(): void {
    this.selectedSpotIndex = null;
    const dock = document.getElementById('build-dock-menu');
    const backdrop = document.getElementById('menu-backdrop');
    if (dock) dock.classList.add('hidden');

    const inspect = document.getElementById('tower-inspect-card');
    const inspectOpen = inspect && !inspect.classList.contains('hidden');
    if (backdrop && !inspectOpen) backdrop.classList.add('hidden');

    this.gameScene.clearRange();
  }

  private updateBuildMenuCards(): void {
    const gold = this.gameScene.gold;
    const cards = document.querySelectorAll('.tower-card');
    cards.forEach(card => {
      const type = (card as HTMLElement).getAttribute('data-type') as TowerType;
      if (type) {
        const cost = TOWERS_CONFIG[type].cost;
        const btn = card as HTMLButtonElement;
        if (gold < cost) {
          btn.classList.add('disabled');
          btn.disabled = true;
        } else {
          btn.classList.remove('disabled');
          btn.disabled = false;
        }
      }
    });
  }

  private bindSpellEvents(): void {
    const btnLightning = document.getElementById('btn-spell-lightning');
    if (btnLightning) {
      bindTap(btnLightning, () => {
        this.triggerHaptic(25);
        SoundSynthesizer.getInstance().playUiClick();
        if (this.gameScene.activeSpell === 'LIGHTNING') {
          this.clearSpellSelection();
        } else {
          this.gameScene.activeSpell = 'LIGHTNING';
          btnLightning.classList.add('active');
        }
      });
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
      bindTap(closeBtn, () => {
        this.triggerHaptic(15);
        SoundSynthesizer.getInstance().playUiClick();
        this.closeInspectCard();
      });
    }

    if (btnUpg) {
      bindTap(btnUpg, () => {
        if (!this.selectedTower) return;
        const cost = this.selectedTower.getUpgradeCost();
        if (this.gameScene.gold >= cost) {
          this.triggerHaptic(40);
          this.gameScene.spendGold(cost);
          this.selectedTower.upgrade();
          this.updateInspectCardStats();
          this.gameScene.showRange(this.selectedTower.x, this.selectedTower.y, this.selectedTower.currentRange);
        } else {
          this.triggerHaptic(100);
          SoundSynthesizer.getInstance().playError();
        }
      });
    }

    if (btnSell) {
      bindTap(btnSell, () => {
        if (!this.selectedTower) return;
        this.triggerHaptic(25);
        const sellVal = this.selectedTower.getSellValue();
        this.gameScene.addGold(sellVal);
        SoundSynthesizer.getInstance().playCoin();
        this.gameScene.removeTower(this.selectedTower);
        this.closeInspectCard();
      });
    }

    const targetBtns = document.querySelectorAll('.target-btn');
    targetBtns.forEach(btn => {
      bindTap(btn as HTMLElement, (e) => {
        const target = (e.currentTarget as HTMLElement).getAttribute('data-target') as TargetingMode;
        if (target && this.selectedTower) {
          this.triggerHaptic(15);
          SoundSynthesizer.getInstance().playUiClick();
          this.selectedTower.targetingMode = target;
          targetBtns.forEach(b => b.classList.remove('active'));
          (e.currentTarget as HTMLElement).classList.add('active');
        }
      });
    });
  }

  public openInspectCard(tower: Tower): void {
    this.selectedTower = tower;
    this.closeBuildMenu();

    const card = document.getElementById('tower-inspect-card');
    const backdrop = document.getElementById('menu-backdrop');
    if (!card) return;

    card.classList.remove('hidden');
    if (backdrop) backdrop.classList.remove('hidden');
    this.updateInspectCardStats();
  }

  public closeInspectCard(): void {
    this.selectedTower = null;
    const card = document.getElementById('tower-inspect-card');
    const backdrop = document.getElementById('menu-backdrop');
    if (card) card.classList.add('hidden');

    const dock = document.getElementById('build-dock-menu');
    const dockOpen = dock && !dock.classList.contains('hidden');
    if (backdrop && !dockOpen) backdrop.classList.add('hidden');

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
      bindTap(btnCallWave, () => {
        this.triggerHaptic(30);
        this.closeBuildMenu();
        this.closeInspectCard();
        this.gameScene.startNextWave();
      });
    }
  }

  public setWaveButtonState(inProgress: boolean): void {
    const btnText = document.getElementById('btn-call-wave-text');
    if (btnText) {
      btnText.innerText = inProgress ? 'KAMPF LÄUFT...' : 'NÄCHSTE WELLE';
    }
  }

  public showWaveBanner(_waveNumber: number, _isBoss: boolean): void {
    // Announce wave
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
      bindTap(btnRestart, () => {
        this.triggerHaptic(25);
        SoundSynthesizer.getInstance().playUiClick();
        this.hideModal();
        this.gameScene.restartLevel();
      });
    }

    if (btnMenu) {
      bindTap(btnMenu, () => {
        this.triggerHaptic(25);
        SoundSynthesizer.getInstance().playUiClick();
        this.hideModal();
        const hud = document.getElementById('hud-overlay');
        if (hud) hud.classList.add('hidden');
        this.closeBuildMenu();
        this.closeInspectCard();
        this.gameScene.scene.stop('GameScene');
        this.scene.stop('UIScene');
        this.gameScene.scene.start('WorldMapScene');
      });
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
