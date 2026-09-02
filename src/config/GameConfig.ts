import { TowerStats, EnemyStats, MapData, WaveConfig, TowerType, EnemyType } from '../types/game';

export const TOWERS_CONFIG: Record<TowerType, TowerStats> = {
  SLINGER: {
    id: 'SLINGER',
    name: 'Steinschleuder-Turm',
    icon: '🏹',
    cost: 70,
    damage: 14,
    range: 145,
    fireRate: 2.6,
    description: 'Einfacher hölzerner Wachturm. Feuert zielsichere Schleudersteine und Pfeile auf nahe Feinde.',
    special: 'Schnellfeuer',
    upgradeCostMult: 1.4,
    damageMultPerLevel: 1.6,
    rangeMultPerLevel: 1.15
  },
  CROSSBOW: {
    id: 'CROSSBOW',
    name: 'Armbrust-Bastion',
    icon: '⚔️',
    cost: 110,
    damage: 28,
    range: 165,
    fireRate: 3.2,
    description: 'Verstärkte Stein-Festung mit schweren Armbrust-Bolzen. Hohe Reichweite und Durchschlagskraft.',
    special: 'Kritische Bolzen',
    upgradeCostMult: 1.45,
    damageMultPerLevel: 1.65,
    rangeMultPerLevel: 1.12
  },
  MAGE: {
    id: 'MAGE',
    name: 'Runen-Magier',
    icon: '🔮',
    cost: 130,
    damage: 42,
    range: 155,
    fireRate: 1.2,
    description: 'Schwebender arkaner Runen-Altar. Feuert magische Energiebälle, die physische Rüstung ignorieren.',
    special: 'Rüstungsbrecher',
    upgradeCostMult: 1.5,
    damageMultPerLevel: 1.7,
    rangeMultPerLevel: 1.15
  },
  MORTAR: {
    id: 'MORTAR',
    name: 'Drachen-Mörser',
    icon: '🐉',
    cost: 150,
    damage: 85,
    range: 185,
    fireRate: 0.65,
    description: 'Schwere Drachenmaul-Artillerie. Feuert explodierende Brandbomben mit riesigem Flächenschaden.',
    special: 'Flächenschaden (AoE)',
    upgradeCostMult: 1.55,
    damageMultPerLevel: 1.8,
    rangeMultPerLevel: 1.18
  }
};

export const ENEMIES_CONFIG: Record<EnemyType, EnemyStats> = {
  GOBLIN: {
    id: 'GOBLIN',
    name: 'Sand-Goblin',
    hp: 40,
    speed: 120,
    armor: 0,
    magicResist: 0,
    goldReward: 6,
    scoreReward: 40,
    size: 16,
    color: 0x84cc16,
    description: 'Schneller kleiner Wüstenräuber mit Spitzhacke.'
  },
  SCUTTER: {
    id: 'SCUTTER',
    name: 'Dünen-Skorpion',
    hp: 95,
    speed: 95,
    armor: 4,
    magicResist: 0,
    goldReward: 12,
    scoreReward: 80,
    size: 20,
    color: 0xd97706,
    description: 'Gepanzerter Wüsten-Krabbeler mit Chitin-Panzer.'
  },
  GOLEM: {
    id: 'GOLEM',
    name: 'Antiker Stein-Golem',
    hp: 340,
    speed: 48,
    armor: 14,
    magicResist: 0,
    goldReward: 35,
    scoreReward: 240,
    size: 28,
    color: 0xa8a29e,
    description: 'Massiver Felskoloss aus den antiken Ruinen.'
  },
  VULTURE: {
    id: 'VULTURE',
    name: 'Geier-Reiter',
    hp: 130,
    speed: 110,
    armor: 2,
    magicResist: 5,
    goldReward: 18,
    scoreReward: 120,
    size: 22,
    color: 0xb45309,
    description: 'Schnelle Luft-Späher auf dressierten Wüstengeiern.'
  },
  SORCERER: {
    id: 'SORCERER',
    name: 'Wüsten-Zauberer',
    hp: 750,
    speed: 55,
    armor: 6,
    magicResist: 25,
    goldReward: 80,
    scoreReward: 600,
    size: 26,
    color: 0x9333ea,
    description: 'Dunkler Magier mit arkanem Schutzschild.',
    isBoss: true
  }
};

export const STAGE_1_MAP: MapData = {
  id: 1,
  name: 'Sonnental-Ruinen & Oase',
  region: 'Al-Kharid Wüste',
  description: 'Verteidige den Oasenpfad vor den anrückenden Sand-Goblins und antiken Golems!',
  startGold: 320,
  startLives: 20,
  totalWaves: 10,
  // S-Curved winding road through the desert oasis (1024x640 resolution)
  waypoints: [
    { x: 40, y: 220 },     // Spawn: Left Mountain Cave
    { x: 160, y: 230 },
    { x: 260, y: 280 },
    { x: 340, y: 380 },    // Curve down under Ancient Temple
    { x: 460, y: 450 },    // Lower curve past Oasis south
    { x: 620, y: 440 },
    { x: 740, y: 350 },    // Curve up past Oasis east
    { x: 830, y: 240 },    // Near Right Temple
    { x: 920, y: 210 },
    { x: 990, y: 210 }     // Base: Right Fortress exit
  ],
  // Designated circular stone foundations for tower placement
  buildSpots: [
    { x: 210, y: 160 },  // 1. Above first bend
    { x: 190, y: 360 },  // 2. Below first bend
    { x: 330, y: 240 },  // 3. Next to Left Temple
    { x: 380, y: 520 },  // 4. South road near desert tent
    { x: 550, y: 530 },  // 5. South of Oasis
    { x: 540, y: 220 },  // 6. North of Oasis (Chokepoint)
    { x: 710, y: 220 },  // 7. Above east curve
    { x: 700, y: 450 },  // 8. Below east curve
    { x: 880, y: 310 }   // 9. Final defense near Right Temple
  ]
};

export const MAPS: MapData[] = [
  STAGE_1_MAP,
  {
    id: 2,
    name: 'Knochen-Canyon',
    region: 'Todesdünen',
    description: 'Enge Felsenschlucht voller Skorpione und Geierreiter.',
    startGold: 360,
    startLives: 20,
    totalWaves: 12,
    waypoints: [
      { x: 50, y: 120 },
      { x: 300, y: 130 },
      { x: 320, y: 320 },
      { x: 150, y: 450 },
      { x: 500, y: 500 },
      { x: 750, y: 400 },
      { x: 780, y: 180 },
      { x: 980, y: 180 }
    ],
    buildSpots: [
      { x: 180, y: 200 },
      { x: 420, y: 220 },
      { x: 320, y: 430 },
      { x: 620, y: 420 },
      { x: 660, y: 260 },
      { x: 880, y: 280 }
    ]
  },
  {
    id: 3,
    name: 'Sonnen-Pyramide',
    region: 'Königsgräber',
    description: 'Die letzte Ruhestätte des Pharaos. Beschütze die Pyramide vor dem Wüsten-Zauberer!',
    startGold: 400,
    startLives: 20,
    totalWaves: 15,
    waypoints: [
      { x: 50, y: 520 },
      { x: 250, y: 500 },
      { x: 280, y: 260 },
      { x: 512, y: 150 },
      { x: 740, y: 260 },
      { x: 760, y: 500 },
      { x: 980, y: 520 }
    ],
    buildSpots: [
      { x: 170, y: 380 },
      { x: 380, y: 320 },
      { x: 400, y: 140 },
      { x: 620, y: 140 },
      { x: 640, y: 320 },
      { x: 850, y: 380 }
    ]
  }
];

export function generateWaves(totalWaves: number): WaveConfig[] {
  const waves: WaveConfig[] = [];

  for (let w = 1; w <= totalWaves; w++) {
    const isBoss = w === totalWaves || w === 5;
    const groups: WaveConfig['groups'] = [];

    if (w === 1) {
      groups.push({ type: 'GOBLIN', count: 7, interval: 1200, delayBefore: 0 });
    } else if (w === 2) {
      groups.push({ type: 'GOBLIN', count: 9, interval: 1000, delayBefore: 0 });
      groups.push({ type: 'SCUTTER', count: 3, interval: 1600, delayBefore: 2000 });
    } else if (w === 3) {
      groups.push({ type: 'SCUTTER', count: 6, interval: 1300, delayBefore: 0 });
      groups.push({ type: 'GOBLIN', count: 8, interval: 800, delayBefore: 2500 });
    } else if (w === 4) {
      groups.push({ type: 'GOBLIN', count: 12, interval: 700, delayBefore: 0 });
      groups.push({ type: 'VULTURE', count: 4, interval: 1400, delayBefore: 1500 });
    } else if (w === 5) {
      // First Mini-Boss Wave: Stone Golem!
      groups.push({ type: 'GOBLIN', count: 6, interval: 900, delayBefore: 0 });
      groups.push({ type: 'GOLEM', count: 1, interval: 0, delayBefore: 2000 });
      groups.push({ type: 'SCUTTER', count: 4, interval: 1200, delayBefore: 4000 });
    } else if (w < 8) {
      groups.push({ type: 'GOBLIN', count: 14 + w, interval: 600, delayBefore: 0 });
      groups.push({ type: 'SCUTTER', count: 5 + w, interval: 1000, delayBefore: 1500 });
      groups.push({ type: 'VULTURE', count: 3 + w, interval: 1200, delayBefore: 2500 });
      groups.push({ type: 'GOLEM', count: 1 + Math.floor(w * 0.3), interval: 3000, delayBefore: 4000 });
    } else if (w < totalWaves) {
      groups.push({ type: 'SCUTTER', count: 12, interval: 800, delayBefore: 0 });
      groups.push({ type: 'VULTURE', count: 8, interval: 1000, delayBefore: 1500 });
      groups.push({ type: 'GOLEM', count: 3, interval: 2500, delayBefore: 3000 });
    } else {
      // Final Boss: Desert Sorcerer + Golem Escort
      groups.push({ type: 'GOLEM', count: 2, interval: 2500, delayBefore: 0 });
      groups.push({ type: 'SORCERER', count: 1, interval: 0, delayBefore: 3000 });
      groups.push({ type: 'GOBLIN', count: 15, interval: 500, delayBefore: 5000 });
    }

    waves.push({
      waveNumber: w,
      groups,
      rewardBonus: 40 + w * 12,
      isBossWave: isBoss
    });
  }

  return waves;
}
