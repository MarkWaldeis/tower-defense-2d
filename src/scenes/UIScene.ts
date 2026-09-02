import Phaser from 'phaser';
import { GameScene } from './GameScene';
import { TowerType, TargetingMode } from '../types/game';
import { TOWERS_CONFIG } from '../config/GameConfig';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import { Tower } from '../entities/towers/Tower';

export class UIScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private selectedBuildType: TowerType | null = null;
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
    this.renderTowerBuildDrawer();
    this.bindInspectCardEvents();
    this.bindWaveButtonEvents();
    this.bindModalEvents();
  }

  private bindTopBarEvents(): void {
    const btnSpeed = document.getElementById('btn-speed');
    const btnSpeedLabel = document.getElementById('btn-speed-label');
    const btnPause = document.getElementById('btn-pause');
    const btnSound = document.getElementById('btn-sound');
    const btnSoundIcon = document.getElementById('btn-sound-icon');
    const btnFullscreen = document.getElementById('btn-fullscreen');

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

    if (btnFullscreen) {
      btnFullscreen.onclick = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      };
    }
  }

  private renderTowerBuildDrawer(): void {
    const container = document.getElementById('tower-build-list');
    if (!container) return;

    container.innerHTML = '';

    const towerTypes: TowerType[] = ['GATLING', 'LASER', 'ROCKET', 'CRYO', 'TESLA'];

    towerTypes.forEach(type => {
      const config = TOWERS_CONFIG[type];
      const card = document.createElement('div');
      card.className = 'tower-build-card';
      card.id = `build-card-${type}`;
      card.innerHTML = `
        <span class="tbc-icon">${config.icon}</span>
        <span class="tbc-name">${config.name.split(' ')[0]}</span>
        <span class="tbc-cost">🪙 ${config.cost}</span>
      `;

      card.onclick = () => {
        SoundSynthesizer.getInstance().playUiClick();
        this.selectBuildTower(type);
      };

      container.appendChild(card);
    });
  }

  public selectBuildTower(type: TowerType | null): void {
    if (this.selectedBuildType === type) {
      // Toggle off
      this.selectedBuildType = null;
      this.gameScene.setBuildMode(null);
    } else {
      this.selectedBuildType = type;
      this.gameScene.setBuildMode(type);
      this.closeInspectCard();
    }
    this.updateBuildCardsState();
  }

  public updateBuildCardsState(): void {
    const gold = this.gameScene.gold;
    const towerTypes: TowerType[] = ['GATLING', 'LASER', 'ROCKET', 'CRYO', 'TESLA'];

    towerTypes.forEach(type => {
      const card = document.getElementById(`build-card-${type}`);
      if (!card) return;

      const cost = TOWERS_CONFIG[type].cost;
      const canAfford = gold >= cost;

      if (!canAfford) {
        card.classList.add('disabled');
      } else {
        card.classList.remove('disabled');
      }

      if (this.selectedBuildType === type) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
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

    this.updateBuildCardsState();
    if (this.selectedTower) {
      this.updateInspectCardStats();
    }
  }

  public showWaveBanner(waveNumber: number, isBoss: boolean): void {
    const banner = document.getElementById('wave-banner');
    const title = document.getElementById('banner-title');
    const subtitle = document.getElementById('banner-subtitle');

    if (banner && title && subtitle) {
      title.innerText = isBoss ? `⚠️ BOSS WELLE ${waveNumber}!` : `WELLE ${waveNumber} STARTET`;
      subtitle.innerText = isBoss ? 'Warnung: Schwerer Koloss detektiert!' : 'Feinde rücken auf der Route vor!';
      banner.classList.remove('hidden');

      setTimeout(() => {
        banner.classList.add('hidden');
      }, 2500);
    }
  }

  private bindInspectCardEvents(): void {
    const closeBtn = document.getElementById('btn-close-inspect');
    const btnUpgrade = document.getElementById('btn-upgrade-tower');
    const btnSell = document.getElementById('btn-sell-tower');

    if (closeBtn) {
      closeBtn.onclick = () => {
        SoundSynthesizer.getInstance().playUiClick();
        this.closeInspectCard();
      };
    }

    if (btnUpgrade) {
      btnUpgrade.onclick = () => {
        if (!this.selectedTower) return;
        const cost = this.selectedTower.getUpgradeCost();
        if (this.gameScene.gold >= cost) {
          this.gameScene.spendGold(cost);
          this.selectedTower.upgrade();
          this.updateInspectCardStats();
          this.gameScene.gridManager.showTowerRange(
            this.selectedTower.x,
            this.selectedTower.y,
            this.selectedTower.currentRange
          );
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

    // Targeting buttons
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
    this.selectBuildTower(null); // Deselect build preview

    const card = document.getElementById('tower-inspect-card');
    if (!card) return;

    card.classList.remove('hidden');
    this.updateInspectCardStats();
  }

  public closeInspectCard(): void {
    this.selectedTower = null;
    const card = document.getElementById('tower-inspect-card');
    if (card) card.classList.add('hidden');
    this.gameScene.gridManager.clearRange();
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
    const dps = document.getElementById('inspect-dps');
    const upgCost = document.getElementById('inspect-upgrade-cost');
    const sellVal = document.getElementById('inspect-sell-value');
    const btnUpgrade = document.getElementById('btn-upgrade-tower') as HTMLButtonElement;

    if (avatar) avatar.innerText = t.baseStats.icon;
    if (name) name.innerText = t.baseStats.name;
    if (lvl) lvl.innerText = `LVL ${t.level} • MK-${t.level === 1 ? 'I' : t.level === 2 ? 'II' : 'III'}`;
    if (dmg) dmg.innerText = `${t.currentDamage}`;
    if (range) range.innerText = `${t.currentRange}px`;
    if (firerate) firerate.innerText = `${t.currentFireRate.toFixed(1)}/s`;
    if (dps) dps.innerText = `${Math.round(t.currentDamage * t.currentFireRate)}`;

    if (t.level >= 3) {
      if (upgCost) upgCost.innerText = 'MAX LVL';
      if (btnUpgrade) btnUpgrade.disabled = true;
    } else {
      const cost = t.getUpgradeCost();
      if (upgCost) upgCost.innerText = `🪙 ${cost}`;
      if (btnUpgrade) btnUpgrade.disabled = this.gameScene.gold < cost;
    }

    if (sellVal) sellVal.innerText = `+🪙 ${t.getSellValue()}`;

    // Update active target button
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
        this.gameScene.startNextWave();
      };
    }
  }

  public setWaveButtonState(inProgress: boolean): void {
    const btnText = document.getElementById('btn-call-wave-text');
    if (btnText) {
      btnText.innerText = inProgress ? 'WELLE LÄUFT...' : 'NÄCHSTE WELLE';
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
        this.gameScene.scene.start('MainMenuScene');
      };
    }
  }

  public showVictoryModal(score: number, kills: number, lives: number, totalLives: number): void {
    const modal = document.getElementById('game-modal');
    const badge = document.getElementById('modal-badge');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const fScore = document.getElementById('modal-final-score');
    const fKills = document.getElementById('modal-final-kills');
    const fLives = document.getElementById('modal-final-lives');

    if (modal && badge && title && desc && fScore && fKills && fLives) {
      badge.innerText = '🏆';
      title.innerText = 'SIEG! SEKTOR GESICHERT';
      desc.innerText = 'Hervorragende taktische Leistung. Alle Wellen erfolgreich zerstört.';
      fScore.innerText = `${score}`;
      fKills.innerText = `${kills}`;
      fLives.innerText = `${lives} / ${totalLives}`;
      modal.classList.remove('hidden');
    }
  }

  public showDefeatModal(score: number, kills: number, wave: number): void {
    const modal = document.getElementById('game-modal');
    const badge = document.getElementById('modal-badge');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const fScore = document.getElementById('modal-final-score');
    const fKills = document.getElementById('modal-final-kills');
    const fLives = document.getElementById('modal-final-lives');

    if (modal && badge && title && desc && fScore && fKills && fLives) {
      badge.innerText = '💥';
      title.innerText = 'NIEDERLAGE: BASIS ZERSTÖRT';
      desc.innerText = `Die Basis wurde in Welle ${wave} von den feindlichen Kräften überrannt.`;
      fScore.innerText = `${score}`;
      fKills.innerText = `${kills}`;
      fLives.innerText = `0 Leben`;
      modal.classList.remove('hidden');
    }
  }

  public hideModal(): void {
    const modal = document.getElementById('game-modal');
    if (modal) modal.classList.add('hidden');
  }
}
