/**
 * Ultra-reliable tap binding for iOS Safari, Web App, Android and Desktop.
 * Listens to pointerdown for 0ms instantaneous response on touchscreens,
 * and debounces click to prevent duplicate triggers.
 */
export function bindTap(
  element: HTMLElement | null,
  handler: (event: Event) => void
): void {
  if (!element) return;

  const isDisabled = (): boolean =>
    element.classList.contains('disabled') || Boolean((element as HTMLButtonElement).disabled);

  let lastTapTime = 0;

  element.addEventListener('pointerdown', (event: PointerEvent) => {
    if (isDisabled()) return;
    lastTapTime = Date.now();
    handler(event);
  });

  element.addEventListener('click', (event: MouseEvent) => {
    if (isDisabled()) return;
    if (Date.now() - lastTapTime < 400) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    handler(event);
  });
}

interface GameScaleRef {
  canvas: HTMLCanvasElement;
  scale: { width: number; height: number };
}

/**
 * Convert Phaser game-world coordinates to CSS coordinates relative to the HUD overlay.
 * Required because the canvas is letterboxed via Phaser.Scale.FIT.
 */
export function gameToHudCoords(
  game: GameScaleRef,
  gameX: number,
  gameY: number
): { x: number; y: number } {
  const canvas = game.canvas;
  const hud = document.getElementById('hud-overlay');
  if (!canvas || !hud) {
    return { x: gameX, y: gameY };
  }

  const canvasRect = canvas.getBoundingClientRect();
  const hudRect = hud.getBoundingClientRect();
  const scaleX = canvasRect.width / Math.max(1, game.scale.width);
  const scaleY = canvasRect.height / Math.max(1, game.scale.height);

  return {
    x: canvasRect.left - hudRect.left + gameX * scaleX,
    y: canvasRect.top - hudRect.top + gameY * scaleY
  };
}
