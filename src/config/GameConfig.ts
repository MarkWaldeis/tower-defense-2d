import { TowerStats, EnemyStats, MapData, WaveConfig, TowerType, EnemyType } from '../types/game';

export const TOWERS_CONFIG: Record<TowerType, TowerStats> = {
  GATLING: {
    id: 'GATLING',
    name: 'Gatling-Geschütz',
    icon: '🔫',
    cost: 100,
    damage: 16,
    range: 140,
    fireRate: 4.0, // 4 shots/sec
    description: 'Schnellfeuer-Projektilturm. Exzellent gegen schnelle, ungepanzerte Ziele.',
    special: 'Schnellfeuer',
    upgradeCostMult: 1.4,
    damageMultPerLevel: 1.6,
    rangeMultPerLevel: 1.15
  },
  LASER: {
    id: 'LASER',
    name: 'Plasma-Laser',
    icon: '⚡',
    cost: 150,
    damage: 38,
    range: 170,
    fireRate: 8.0, // Continuous damage ticks
    description: 'Dauerhafter Hochenergie-Laserstrahl mit Rüstungsdurchdringung.',
    special: 'Rüstungsbrecher',
    upgradeCostMult: 1.5,
    damageMultPerLevel: 1.7,
    rangeMultPerLevel: 1.12
  },
  ROCKET: {
    id: 'ROCKET',
    name: 'Raketen-Silo',
    icon: '🚀',
    cost: 220,
    damage: 95,
    range: 220,
    fireRate: 0.8, // 1 shot every 1.25s
    description: 'Lenkflugkörper mit massivem Explosions- und Flächenschaden (AoE).',
    special: 'Flächenschaden',
    upgradeCostMult: 1.6,
    damageMultPerLevel: 1.8,
    rangeMultPerLevel: 1.18
  },
  CRYO: {
    id: 'CRYO',
    name: 'Kryo-Emitter',
    icon: '❄️',
    cost: 130,
    damage: 10,
    range: 130,
    fireRate: 1.5,
    description: 'Verlangsamt Feinde im Umkreis um 50% für 3 Sekunden.',
    special: 'Verlangsamung 50%',
    upgradeCostMult: 1.35,
    damageMultPerLevel: 1.4,
    rangeMultPerLevel: 1.2
  },
  TESLA: {
    id: 'TESLA',
    name: 'Tesla-Spule',
    icon: '🔮',
    cost: 260,
    damage: 70,
    range: 160,
    fireRate: 1.2,
    description: 'Kettenblitz springt auf bis zu 4 nahe Feinde über.',
    special: 'Kettenblitz (4 Ziele)',
    upgradeCostMult: 1.6,
    damageMultPerLevel: 1.75,
    rangeMultPerLevel: 1.15
  }
};

export const ENEMIES_CONFIG: Record<EnemyType, EnemyStats> = {
  SCOUT: {
    id: 'SCOUT',
    name: 'Aufklärungs-Drohne',
    hp: 45,
    speed: 130,
    armor: 0,
    goldReward: 8,
    scoreReward: 50,
    size: 16,
    color: 0x00f2ff,
    description: 'Sehr schnell, aber anfällig für Schnellfeuer.'
  },
  RAIDER: {
    id: 'RAIDER',
    name: 'Cyborg-Raider',
    hp: 120,
    speed: 85,
    armor: 4,
    goldReward: 14,
    scoreReward: 100,
    size: 20,
    color: 0xff9f0a,
    description: 'Standard-Kampfeinheit mit leichter Rüstung.'
  },
  TANK: {
    id: 'TANK',
    name: 'Schwerer Mech-Panzer',
    hp: 360,
    speed: 50,
    armor: 15,
    goldReward: 35,
    scoreReward: 250,
    size: 26,
    color: 0xff3b30,
    description: 'Enorme Trefferpunkte und dicke Rüstung.'
  },
  SHIELD_DRONE: {
    id: 'SHIELD_DRONE',
    name: 'Schild-Fregatte',
    hp: 200,
    speed: 75,
    armor: 25,
    goldReward: 24,
    scoreReward: 180,
    size: 22,
    color: 0xbf5af2,
    description: 'Generiert ein Energiereflektionsfeld gegen Projektile.'
  },
  BOSS: {
    id: 'BOSS',
    name: 'KOLOSS TITAN MK-X',
    hp: 2200,
    speed: 38,
    armor: 30,
    goldReward: 150,
    scoreReward: 1500,
    size: 38,
    color: 0xff2d55,
    description: 'Gewaltiger Sektor-Kommandant. Zerstört alles in seinem Pfad.',
    isBoss: true
  }
};

export const MAPS: MapData[] = [
  {
    id: 1,
    name: 'Sektor Alpha: Außenposten',
    subtitle: 'Klassischer Z-Pfad mit optimalen Turm-Chokepoints',
    cols: 16,
    rows: 10,
    tileSize: 64,
    startGold: 450,
    startLives: 20,
    totalWaves: 15,
    tiles: [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [3,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
      [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    waypoints: [
      { x: 0 * 64 + 32, y: 1 * 64 + 32 },
      { x: 6 * 64 + 32, y: 1 * 64 + 32 },
      { x: 6 * 64 + 32, y: 4 * 64 + 32 },
      { x: 12 * 64 + 32, y: 4 * 64 + 32 },
      { x: 12 * 64 + 32, y: 7 * 64 + 32 },
      { x: 1 * 64 + 32, y: 7 * 64 + 32 },
      { x: 1 * 64 + 32, y: 9 * 64 + 32 }
    ]
  },
  {
    id: 2,
    name: 'Sektor Beta: Neon Canyon',
    subtitle: 'Doppelschleife mit engen Serpentinen',
    cols: 16,
    rows: 10,
    tileSize: 64,
    startGold: 500,
    startLives: 20,
    totalWaves: 20,
    tiles: [
      [0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,1,0,0,0,1,1,1,1,1,1,1,0,0,0],
      [0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0],
      [0,0,1,1,1,1,1,0,0,0,0,0,1,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,0,0,1,0,0,0],
      [0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0],
      [0,0,1,0,0,4,1,1,1,1,0,0,1,0,0,0],
      [0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    ],
    waypoints: [
      { x: 2 * 64 + 32, y: 0 * 64 + 32 },
      { x: 2 * 64 + 32, y: 3 * 64 + 32 },
      { x: 6 * 64 + 32, y: 3 * 64 + 32 },
      { x: 6 * 64 + 32, y: 1 * 64 + 32 },
      { x: 12 * 64 + 32, y: 1 * 64 + 32 },
      { x: 12 * 64 + 32, y: 8 * 64 + 32 },
      { x: 9 * 64 + 32, y: 8 * 64 + 32 },
      { x: 9 * 64 + 32, y: 5 * 64 + 32 },
      { x: 2 * 64 + 32, y: 5 * 64 + 32 },
      { x: 2 * 64 + 32, y: 8 * 64 + 32 },
      { x: 5 * 64 + 32, y: 8 * 64 + 32 },
      { x: 5 * 64 + 32, y: 7 * 64 + 32 }
    ]
  }
];

export function generateWaves(totalWaves: number): WaveConfig[] {
  const waves: WaveConfig[] = [];

  for (let w = 1; w <= totalWaves; w++) {
    const isBoss = w % 5 === 0;
    const groups: WaveConfig['groups'] = [];

    if (w === 1) {
      groups.push({ type: 'SCOUT', count: 8, interval: 1100, delayBefore: 0 });
    } else if (w === 2) {
      groups.push({ type: 'SCOUT', count: 10, interval: 900, delayBefore: 0 });
      groups.push({ type: 'RAIDER', count: 4, interval: 1400, delayBefore: 1500 });
    } else if (w === 3) {
      groups.push({ type: 'RAIDER', count: 8, interval: 1200, delayBefore: 0 });
      groups.push({ type: 'SCOUT', count: 8, interval: 700, delayBefore: 2000 });
    } else if (w === 4) {
      groups.push({ type: 'RAIDER', count: 10, interval: 1000, delayBefore: 0 });
      groups.push({ type: 'TANK', count: 2, interval: 2500, delayBefore: 3000 });
    } else if (w === 5) {
      // First Boss Wave
      groups.push({ type: 'RAIDER', count: 6, interval: 1000, delayBefore: 0 });
      groups.push({ type: 'BOSS', count: 1, interval: 0, delayBefore: 2000 });
      groups.push({ type: 'SCOUT', count: 6, interval: 800, delayBefore: 4000 });
    } else if (w < 10) {
      const multiplier = w * 1.3;
      groups.push({ type: 'SCOUT', count: Math.floor(6 + multiplier), interval: 700, delayBefore: 0 });
      groups.push({ type: 'RAIDER', count: Math.floor(4 + multiplier * 0.8), interval: 900, delayBefore: 1500 });
      groups.push({ type: 'SHIELD_DRONE', count: Math.floor(1 + w * 0.4), interval: 1600, delayBefore: 2500 });
      if (w >= 7) {
        groups.push({ type: 'TANK', count: Math.floor(w * 0.5), interval: 2000, delayBefore: 4000 });
      }
    } else if (w === 10) {
      // Mid-Boss Wave
      groups.push({ type: 'TANK', count: 4, interval: 1800, delayBefore: 0 });
      groups.push({ type: 'BOSS', count: 1, interval: 0, delayBefore: 3000 });
      groups.push({ type: 'SHIELD_DRONE', count: 4, interval: 1200, delayBefore: 5000 });
    } else if (w < 15) {
      groups.push({ type: 'SCOUT', count: 16 + w, interval: 500, delayBefore: 0 });
      groups.push({ type: 'RAIDER', count: 12 + w, interval: 750, delayBefore: 1000 });
      groups.push({ type: 'SHIELD_DRONE', count: 4 + Math.floor(w * 0.3), interval: 1200, delayBefore: 2000 });
      groups.push({ type: 'TANK', count: 4 + Math.floor(w * 0.4), interval: 1600, delayBefore: 3000 });
    } else {
      // Final Super Boss Wave
      groups.push({ type: 'TANK', count: 6, interval: 1400, delayBefore: 0 });
      groups.push({ type: 'BOSS', count: 2, interval: 4000, delayBefore: 2000 });
      groups.push({ type: 'SHIELD_DRONE', count: 8, interval: 900, delayBefore: 5000 });
    }

    waves.push({
      waveNumber: w,
      groups,
      rewardBonus: 50 + w * 15,
      isBossWave: isBoss
    });
  }

  return waves;
}
