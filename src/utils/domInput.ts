/**
 * Reliable tap binding for iOS Safari / WKWebView and desktop.
 * On touch: handle on touchend and preventDefault to suppress the ghost click.
 * On mouse/pen: use click.
 */
export function bindTap(
  element: HTMLElement | null,
  handler: (event: Event) => void
): void {
  if (!element) return;

  const isDisabled = (): boolean =>
    element.classList.contains('disabled') || Boolean((element as HTMLButtonElement).disabled);

  let touchHandledAt = 0;

  element.addEventListener(
    'touchend',
    (event: TouchEvent) => {
      if (isDisabled()) return;
      // Suppress the synthetic mouse click that iOS would fire ~300ms later
      // (important when the handler removes/hides the element).
      event.preventDefault();
      touchHandledAt = Date.now();
      handler(event);
    },
    { passive: false }
  );

  element.addEventListener('click', (event: MouseEvent) => {
    if (isDisabled()) return;
    // Ignore the ghost click after a touchend we already handled
    if (Date.now() - touchHandledAt < 700) {
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
