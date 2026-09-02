import Phaser from 'phaser';
import { MapData, TileType, GridCoord, Point } from '../types/game';

export class GridManager {
  private scene: Phaser.Scene;
  public mapData: MapData;
  private gridMatrix: number[][];
  private gridGraphics: Phaser.GameObjects.Graphics;
  private previewGraphics: Phaser.GameObjects.Graphics;
  private rangeGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, mapData: MapData) {
    this.scene = scene;
    this.mapData = mapData;
    this.gridMatrix = mapData.tiles.map(row => [...row]);

    this.gridGraphics = this.scene.add.graphics().setDepth(2);
    this.previewGraphics = this.scene.add.graphics().setDepth(12);
    this.rangeGraphics = this.scene.add.graphics().setDepth(11);

    this.renderMapTiles();
  }

  public renderMapTiles(): void {
    const { cols, rows, tileSize, waypoints } = this.mapData;
    this.gridGraphics.clear();

    // 1. Draw subtle background tiles
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const type = this.gridMatrix[r][c];
        const x = c * tileSize;
        const y = r * tileSize;

        if (type === TileType.PATH || type === TileType.SPAWN || type === TileType.BASE) {
          // Road tile - Dark metallic path with glowing borders
          this.gridGraphics.fillStyle(0x131a2c, 1);
          this.gridGraphics.fillRoundedRect(x + 2, y + 2, tileSize - 4, tileSize - 4, 6);
          this.gridGraphics.lineStyle(1, 0x00f2ff, 0.25);
          this.gridGraphics.strokeRoundedRect(x + 2, y + 2, tileSize - 4, tileSize - 4, 6);
        } else {
          // Buildable terrain grid
          this.gridGraphics.fillStyle(0x0a0f1d, 0.95);
          this.gridGraphics.fillRoundedRect(x + 3, y + 3, tileSize - 6, tileSize - 6, 8);
          this.gridGraphics.lineStyle(1, 0x24324f, 0.4);
          this.gridGraphics.strokeRoundedRect(x + 3, y + 3, tileSize - 6, tileSize - 6, 8);
        }
      }
    }

    // 2. Draw glowing tactical road wayline
    if (waypoints.length > 1) {
      this.gridGraphics.lineStyle(4, 0x00f2ff, 0.4);
      this.gridGraphics.beginPath();
      this.gridGraphics.moveTo(waypoints[0].x, waypoints[0].y);
      for (let i = 1; i < waypoints.length; i++) {
        this.gridGraphics.lineTo(waypoints[i].x, waypoints[i].y);
      }
      this.gridGraphics.strokePath();

      // Spawn Portal & Base Markers
      const spawn = waypoints[0];
      const base = waypoints[waypoints.length - 1];

      // Spawn Marker (Neon Green Portal)
      this.gridGraphics.fillStyle(0x32d74b, 0.3);
      this.gridGraphics.fillCircle(spawn.x, spawn.y, 22);
      this.gridGraphics.lineStyle(2, 0x32d74b, 0.8);
      this.gridGraphics.strokeCircle(spawn.x, spawn.y, 22);

      // Base Core Marker (Neon Danger Red HQ)
      this.gridGraphics.fillStyle(0xff453a, 0.3);
      this.gridGraphics.fillCircle(base.x, base.y, 24);
      this.gridGraphics.lineStyle(2, 0xff453a, 0.9);
      this.gridGraphics.strokeCircle(base.x, base.y, 24);
    }
  }

  public pixelToGrid(x: number, y: number): GridCoord {
    const col = Math.floor(x / this.mapData.tileSize);
    const row = Math.floor(y / this.mapData.tileSize);
    return { col, row };
  }

  public gridToPixelCenter(col: number, row: number): Point {
    const s = this.mapData.tileSize;
    return {
      x: col * s + s / 2,
      y: row * s + s / 2
    };
  }

  public isBuildable(col: number, row: number): boolean {
    if (col < 0 || col >= this.mapData.cols || row < 0 || row >= this.mapData.rows) {
      return false;
    }
    return this.gridMatrix[row][col] === TileType.BUILDABLE;
  }

  public setOccupied(col: number, row: number, isOccupied: boolean): void {
    if (col >= 0 && col < this.mapData.cols && row >= 0 && row < this.mapData.rows) {
      this.gridMatrix[row][col] = isOccupied ? 99 : TileType.BUILDABLE;
    }
  }

  public showPlacementPreview(col: number, row: number, range: number): void {
    this.previewGraphics.clear();
    this.rangeGraphics.clear();

    const { cols, rows, tileSize } = this.mapData;
    if (col < 0 || col >= cols || row < 0 || row >= rows) return;

    const buildable = this.isBuildable(col, row);
    const center = this.gridToPixelCenter(col, row);
    const x = col * tileSize;
    const y = row * tileSize;

    // Tile box highlight
    const color = buildable ? 0x32d74b : 0xff453a;
    this.previewGraphics.fillStyle(color, 0.25);
    this.previewGraphics.fillRoundedRect(x + 4, y + 4, tileSize - 8, tileSize - 8, 8);
    this.previewGraphics.lineStyle(2, color, 0.9);
    this.previewGraphics.strokeRoundedRect(x + 4, y + 4, tileSize - 8, tileSize - 8, 8);

    // Range Circle
    if (buildable) {
      this.rangeGraphics.fillStyle(0x00f2ff, 0.08);
      this.rangeGraphics.fillCircle(center.x, center.y, range);
      this.rangeGraphics.lineStyle(1.5, 0x00f2ff, 0.6);
      this.rangeGraphics.strokeCircle(center.x, center.y, range);
    }
  }

  public clearPreview(): void {
    this.previewGraphics.clear();
    this.rangeGraphics.clear();
  }

  public showTowerRange(x: number, y: number, range: number): void {
    this.rangeGraphics.clear();
    this.rangeGraphics.fillStyle(0x00f2ff, 0.1);
    this.rangeGraphics.fillCircle(x, y, range);
    this.rangeGraphics.lineStyle(2, 0x00f2ff, 0.7);
    this.rangeGraphics.strokeCircle(x, y, range);
  }

  public clearRange(): void {
    this.rangeGraphics.clear();
  }
}
