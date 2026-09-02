import { TowerStats, EnemyStats, MapData, WaveConfig, TowerType, EnemyType } from '../types/game';

export const TOWERS_CONFIG: Record<TowerType, TowerStats> = {
  SLINGER: {
    id: 'SLINGER',
    name: 'Steinschleuder-Turm',
    icon: '🏹',
    cost: 70,
    damage: 15,
    range: 150,
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
    damage: 32,
    range: 170,
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
    damage: 46,
    range: 160,
    fireRate: 1.3,
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
    damage: 90,
    range: 190,
    fireRate: 0.7,
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
    hp: 42,
    speed: 125,
    armor: 0,
    magicResist: 0,
    goldReward: 6,
    scoreReward: 40,
    size: 18,
    color: 0x84cc16,
    description: 'Schneller kleiner Wüstenräuber mit Spitzhacke.'
  },
  SCUTTER: {
    id: 'SCUTTER',
    name: 'Dünen-Skorpion',
    hp: 100,
    speed: 95,
    armor: 5,
    magicResist: 0,
    goldReward: 12,
    scoreReward: 80,
    size: 22,
    color: 0xd97706,
    description: 'Gepanzerter Wüsten-Krabbeler mit Chitin-Panzer.'
  },
  GOLEM: {
    id: 'GOLEM',
    name: 'Antiker Stein-Golem',
    hp: 360,
    speed: 50,
    armor: 16,
    magicResist: 0,
    goldReward: 35,
    scoreReward: 250,
    size: 30,
    color: 0xa8a29e,
    description: 'Massiver Felskoloss aus den antiken Ruinen.'
  },
  VULTURE: {
    id: 'VULTURE',
    name: 'Geier-Reiter',
    hp: 140,
    speed: 115,
    armor: 2,
    magicResist: 5,
    goldReward: 18,
    scoreReward: 120,
    size: 24,
    color: 0xb45309,
    description: 'Schnelle Luft-Späher auf dressierten Wüstengeiern.'
  },
  SORCERER: {
    id: 'SORCERER',
    name: 'Wüsten-Zauberer',
    hp: 800,
    speed: 55,
    armor: 6,
    magicResist: 30,
    goldReward: 80,
    scoreReward: 650,
    size: 28,
    color: 0x9333ea,
    description: 'Dunkler Magier mit arkanem Schutzschild.',
    isBoss: true
  }
};

export const STAGE_1_MAP: MapData = {
  id: 1,
  name: 'Sonnental-Ruinen & Oase',
  region: 'Al-Kharid Oase',
  description: 'Verteidige den Oasenpfad vor den anrückenden Sand-Goblins und antiken Golems!',
  startGold: 320,
  startLives: 20,
  totalWaves: 10,
  // Waypoints matching the desert canyon road from the concept illustration
  waypoints: [
    { x: 95, y: 310 },     // 0. Spawn Cave on the left
    { x: 215, y: 410 },    // 1. Foot of Temple terrace
    { x: 285, y: 500 },    // 2. Southwest curve
    { x: 420, y: 550 },    // 3. South curve under Oasis
    { x: 620, y: 515 },    // 4. Southeast curve
    { x: 795, y: 440 },    // 5. East curve around Oasis
    { x: 745, y: 310 },    // 6. Between temple and small houses
    { x: 670, y: 220 },    // 7. North canyon pass
    { x: 575, y: 50 }      // 8. Canyon Exit to North Kingdom
  ],
  // Precise stone foundation pads matching the illustration
  buildSpots: [
    { x: 318, y: 382 },  // Pad 1: Upper-left bend next to temple
    { x: 395, y: 450 },  // Pad 2: Southwest of oasis
    { x: 472, y: 470 },  // Pad 3: South of oasis
    { x: 768, y: 358 },  // Pad 6: East of oasis
    { x: 628, y: 275 },  // Pad 7: North of oasis (chokepoint)
    { x: 722, y: 195 },  // Pad 8: In front of upper-right temple
    { x: 842, y: 265 },  // Pad 4: Right side of road near temple stairs
    { x: 175, y: 345 }   // Pad: Near cave entrance
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
      { x: 95, y: 310 },
      { x: 285, y: 500 },
      { x: 620, y: 515 },
      { x: 745, y: 310 },
      { x: 575, y: 50 }
    ],
    buildSpots: [
      { x: 318, y: 382 },
      { x: 472, y: 470 },
      { x: 628, y: 275 },
      { x: 722, y: 195 }
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
      { x: 95, y: 310 },
      { x: 420, y: 550 },
      { x: 795, y: 440 },
      { x: 575, y: 50 }
    ],
    buildSpots: [
      { x: 318, y: 382 },
      { x: 395, y: 450 },
      { x: 472, y: 470 },
      { x: 768, y: 358 },
      { x: 628, y: 275 },
      { x: 722, y: 195 }
    ]
  }
];

export function generateWaves(totalWaves: number): WaveConfig[] {
  const waves: WaveConfig[] = [];

  for (let w = 1; w <= totalWaves; w++) {
    const isBoss = w === totalWaves || w === 5;
    const groups: WaveConfig['groups'] = [];

    if (w === 1) {
      groups.push({ type: 'GOBLIN', count: 8, interval: 1100, delayBefore: 0 });
    } else if (w === 2) {
      groups.push({ type: 'GOBLIN', count: 10, interval: 950, delayBefore: 0 });
      groups.push({ type: 'SCUTTER', count: 3, interval: 1500, delayBefore: 2000 });
    } else if (w === 3) {
      groups.push({ type: 'SCUTTER', count: 6, interval: 1200, delayBefore: 0 });
      groups.push({ type: 'GOBLIN', count: 8, interval: 750, delayBefore: 2500 });
    } else if (w === 4) {
      groups.push({ type: 'GOBLIN', count: 12, interval: 650, delayBefore: 0 });
      groups.push({ type: 'VULTURE', count: 4, interval: 1300, delayBefore: 1500 });
    } else if (w === 5) {
      // First Mini-Boss Wave: Stone Golem!
      groups.push({ type: 'GOBLIN', count: 6, interval: 850, delayBefore: 0 });
      groups.push({ type: 'GOLEM', count: 1, interval: 0, delayBefore: 2000 });
      groups.push({ type: 'SCUTTER', count: 4, interval: 1100, delayBefore: 4000 });
    } else if (w < 8) {
      groups.push({ type: 'GOBLIN', count: 14 + w, interval: 550, delayBefore: 0 });
      groups.push({ type: 'SCUTTER', count: 5 + w, interval: 950, delayBefore: 1500 });
      groups.push({ type: 'VULTURE', count: 3 + w, interval: 1100, delayBefore: 2500 });
      groups.push({ type: 'GOLEM', count: 1 + Math.floor(w * 0.3), interval: 2800, delayBefore: 4000 });
    } else if (w < totalWaves) {
      groups.push({ type: 'SCUTTER', count: 12, interval: 750, delayBefore: 0 });
      groups.push({ type: 'VULTURE', count: 8, interval: 900, delayBefore: 1500 });
      groups.push({ type: 'GOLEM', count: 3, interval: 2200, delayBefore: 3000 });
    } else {
      // Final Boss: Desert Sorcerer + Golem Escort
      groups.push({ type: 'GOLEM', count: 2, interval: 2200, delayBefore: 0 });
      groups.push({ type: 'SORCERER', count: 1, interval: 0, delayBefore: 3000 });
      groups.push({ type: 'GOBLIN', count: 16, interval: 450, delayBefore: 5000 });
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
