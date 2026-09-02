import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WorldMapScene } from './scenes/WorldMapScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { SoundSynthesizer } from './audio/SoundSynthesizer';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1024,
  height: 576,
  backgroundColor: '#2e1a0d',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 576,
    // Expand to fill available space on mobile after rotation / notch changes
    expandParent: true
  },
  input: {
    activePointers: 3,
    touch: true,
    mouse: true
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
    powerPreference: 'high-performance'
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [BootScene, WorldMapScene, GameScene, UIScene]
};

// Initialize Game
export const game = new Phaser.Game(config);

function refreshScale(): void {
  if (game && game.scale) {
    game.scale.refresh();
  }
}

window.addEventListener('resize', refreshScale);
window.addEventListener('orientationchange', () => {
  // iOS often reports the old size briefly — refresh twice
  refreshScale();
  window.setTimeout(refreshScale, 250);
});

// Unlock WebAudio on the first user gesture (required on iOS Safari / WKWebView)
const unlockAudio = (): void => {
  SoundSynthesizer.getInstance().unlock();
  window.removeEventListener('touchstart', unlockAudio);
  window.removeEventListener('pointerdown', unlockAudio);
};
window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
window.addEventListener('pointerdown', unlockAudio, { once: true });
