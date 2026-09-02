import { TowerStats, EnemyStats, MapData, WaveConfig, TowerType, EnemyType } from '../types/game';

export const TOWERS_CONFIG: Record<TowerType, TowerStats> = {
  SLINGER: {
    id: 'SLINGER',
    name: 'Steinschleuder-Turm',
    icon: '🏹',
    cost: 70,
    damage: 16,
    range: 155,
    fireRate: 2.6,
    description: 'Einfacher hölzerner Wachturm. Feuert zielsichere Schleudersteine und Pfeile auf nahe Feinde.',
    special: 'Schnellfeuer',
    upgradeCostMult: 1.4,
    damageMultPerLevel: 1.65,
    rangeMultPerLevel: 1.15,
    tiers: [
      {
        tier: 1,
        name: 'Holzwachturm',
        title: 'STUFE 1 • BASIC',
        damage: 16,
        range: 155,
        fireRate: 2.6,
        upgradeCost: 95,
        specialAbility: 'Schnellfeuer'
      },
      {
        tier: 2,
        name: 'Jäger-Bastion',
        title: 'STUFE 2 • VERSTÄRKT',
        damage: 28,
        range: 175,
        fireRate: 3.1,
        upgradeCost: 150,
        specialAbility: 'Doppelschuss (2 Pfeile)'
      },
      {
        tier: 3,
        name: 'Königs-Scharfschütze',
        title: 'STUFE 3 • MEISTER',
        damage: 52,
        range: 205,
        fireRate: 3.6,
        upgradeCost: 0,
        specialAbility: 'Kritischer Kopfschuss (3x Dmg)'
      }
    ]
  },
  CROSSBOW: {
    id: 'CROSSBOW',
    name: 'Armbrust-Bastion',
    icon: '⚔️',
    cost: 110,
    damage: 34,
    range: 175,
    fireRate: 1.6,
    description: 'Verstärkte Stein-Festung mit schweren Armbrust-Bolzen. Hohe Reichweite und Durchschlagskraft.',
    special: 'Kritische Bolzen',
    upgradeCostMult: 1.45,
    damageMultPerLevel: 1.7,
    rangeMultPerLevel: 1.15,
    tiers: [
      {
        tier: 1,
        name: 'Stein-Bastion',
        title: 'STUFE 1 • BASIC',
        damage: 34,
        range: 175,
        fireRate: 1.6,
        upgradeCost: 135,
        specialAbility: 'Rüstungsdurchschlag'
      },
      {
        tier: 2,
        name: 'Schwere Balliste',
        title: 'STUFE 2 • VERSTÄRKT',
        damage: 60,
        range: 200,
        fireRate: 1.9,
        upgradeCost: 210,
        specialAbility: 'Durchbohrende Lanzen'
      },
      {
        tier: 3,
        name: 'Drachen-Armbrust-Festung',
        title: 'STUFE 3 • MEISTER',
        damage: 110,
        range: 230,
        fireRate: 2.2,
        upgradeCost: 0,
        specialAbility: 'Flächen-Bolzensalve'
      }
    ]
  },
  MAGE: {
    id: 'MAGE',
    name: 'Runen-Magier',
    icon: '🔮',
    cost: 130,
    damage: 48,
    range: 165,
    fireRate: 1.3,
    description: 'Schwebender arkaner Runen-Altar. Feuert magische Energiebälle, die physische Rüstung ignorieren.',
    special: 'Rüstungsbrecher',
    upgradeCostMult: 1.5,
    damageMultPerLevel: 1.75,
    rangeMultPerLevel: 1.15,
    tiers: [
      {
        tier: 1,
        name: 'Runen-Altar',
        title: 'STUFE 1 • BASIC',
        damage: 48,
        range: 165,
        fireRate: 1.3,
        upgradeCost: 160,
        specialAbility: 'Reiner Magieschaden'
      },
      {
        tier: 2,
        name: 'Arkaner Sphären-Turm',
        title: 'STUFE 2 • VERSTÄRKT',
        damage: 86,
        range: 190,
        fireRate: 1.6,
        upgradeCost: 240,
        specialAbility: 'Verlangsamungs-Fluch (-35% Tempo)'
      },
      {
        tier: 3,
        name: 'Erzmagier-Altar',
        title: 'STUFE 3 • MEISTER',
        damage: 155,
        range: 220,
        fireRate: 1.9,
        upgradeCost: 0,
        specialAbility: 'Desintegrations-Strahl'
      }
    ]
  },
  MORTAR: {
    id: 'MORTAR',
    name: 'Drachen-Mörser',
    icon: '🐉',
    cost: 150,
    damage: 95,
    range: 195,
    fireRate: 0.75,
    description: 'Schwere Drachenmaul-Artillerie. Feuert explodierende Brandbomben mit riesigem Flächenschaden.',
    special: 'Flächenschaden (AoE)',
    upgradeCostMult: 1.55,
    damageMultPerLevel: 1.8,
    rangeMultPerLevel: 1.18,
    tiers: [
      {
        tier: 1,
        name: 'Belagerungs-Kanone',
        title: 'STUFE 1 • BASIC',
        damage: 95,
        range: 195,
        fireRate: 0.75,
        upgradeCost: 180,
        specialAbility: 'Flächenexplosion (80px)'
      },
      {
        tier: 2,
        name: 'Schwerer Drachen-Mörser',
        title: 'STUFE 2 • VERSTÄRKT',
        damage: 175,
        range: 225,
        fireRate: 0.9,
        upgradeCost: 275,
        specialAbility: 'Bodenbrand-Feuer (AoE DoT)'
      },
      {
        tier: 3,
        name: 'Feuerdrachen-Artillerie',
        title: 'STUFE 3 • MEISTER',
        damage: 320,
        range: 260,
        fireRate: 1.1,
        upgradeCost: 0,
        specialAbility: 'Mega-Kometenkrater (140px AoE)'
      }
    ]
  }
};

export const ENEMIES_CONFIG: Record<EnemyType, EnemyStats> = {
  GOBLIN: {
    id: 'GOBLIN',
    name: 'Sand-Goblin',
    hp: 45,
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
    hp: 110,
    speed: 95,
    armor: 6,
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
    hp: 380,
    speed: 50,
    armor: 18,
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
    hp: 150,
    speed: 115,
    armor: 3,
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
    hp: 850,
    speed: 55,
    armor: 6,
    magicResist: 35,
    goldReward: 80,
    scoreReward: 650,
    size: 28,
    color: 0x9333ea,
    description: 'Dunkler Magier mit arkanem Schutzschild.',
    isBoss: true
  },
  MUMMY: {
    id: 'MUMMY',
    name: 'Pharao-Mumie',
    hp: 1200,
    speed: 45,
    armor: 24,
    magicResist: 20,
    goldReward: 120,
    scoreReward: 1000,
    size: 32,
    color: 0xeab308,
    description: 'Uralter Herrscher mit Fluch-Aura und hoher Rüstung.',
    isBoss: true
  }
};

export const MAPS: MapData[] = [
  {
    id: 1,
    name: 'Sonnental-Ruinen & Oase',
    region: 'Al-Kharid Oase',
    description: 'Verteidige den Oasenpfad vor den anrückenden Sand-Goblins und antiken Golems!',
    bgTextureKey: 'map_desert_ruins',
    startGold: 320,
    startLives: 20,
    totalWaves: 10,
    waypoints: [
      { x: 95, y: 310 },
      { x: 215, y: 410 },
      { x: 285, y: 500 },
      { x: 420, y: 550 },
      { x: 620, y: 515 },
      { x: 795, y: 440 },
      { x: 745, y: 310 },
      { x: 670, y: 220 },
      { x: 575, y: 50 }
    ],
    buildSpots: [
      { x: 318, y: 382 },
      { x: 395, y: 450 },
      { x: 472, y: 470 },
      { x: 768, y: 358 },
      { x: 628, y: 275 },
      { x: 722, y: 195 },
      { x: 842, y: 265 },
      { x: 175, y: 345 }
    ]
  },
  {
    id: 2,
    name: 'Knochen-Canyon & Ruinen',
    region: 'Ruinen von Amun',
    description: 'Schlucht mit riesigen Fossilien und Hängebrücken. Hüte dich vor den Geiern und der Pharao-Mumie!',
    bgTextureKey: 'map_bone_canyon',
    startGold: 360,
    startLives: 20,
    totalWaves: 12,
    waypoints: [
      { x: 875, y: 240 },
      { x: 800, y: 330 },
      { x: 835, y: 430 },
      { x: 565, y: 460 },
      { x: 340, y: 520 },
      { x: 220, y: 460 },
      { x: 270, y: 280 }
    ],
    buildSpots: [
      { x: 635, y: 215 },
      { x: 785, y: 275 },
      { x: 845, y: 375 },
      { x: 440, y: 245 },
      { x: 450, y: 335 },
      { x: 395, y: 380 },
      { x: 345, y: 430 },
      { x: 245, y: 485 }
    ]
  },
  {
    id: 3,
    name: 'Goldene Sonnen-Pyramide',
    region: 'Kaelestria Königspyramide',
    description: 'Die gewaltige Königs-Pyramide von Kaelestria! Besiege den Pharao und seine gesamte Golem-Armee!',
    bgTextureKey: 'map_sun_pyramid',
    startGold: 420,
    startLives: 20,
    totalWaves: 15,
    waypoints: [
      { x: 80, y: 470 },
      { x: 130, y: 330 },
      { x: 220, y: 240 },
      { x: 380, y: 430 },
      { x: 505, y: 350 },
      { x: 505, y: 210 }
    ],
    buildSpots: [
      { x: 100, y: 250 },
      { x: 160, y: 360 },
      { x: 160, y: 465 },
      { x: 265, y: 520 },
      { x: 425, y: 470 },
      { x: 535, y: 465 },
      { x: 580, y: 440 },
      { x: 735, y: 505 }
    ]
  }
];

export function generateWaves(totalWaves: number, levelId: number = 1): WaveConfig[] {
  const waves: WaveConfig[] = [];

  for (let w = 1; w <= totalWaves; w++) {
    const isBoss = w === totalWaves || w === Math.floor(totalWaves / 2);
    const groups: WaveConfig['groups'] = [];

    if (w === 1) {
      groups.push({ type: 'GOBLIN', count: 8 + levelId * 2, interval: 1000, delayBefore: 0 });
    } else if (w === 2) {
      groups.push({ type: 'GOBLIN', count: 10, interval: 900, delayBefore: 0 });
      groups.push({ type: 'SCUTTER', count: 3 + levelId, interval: 1400, delayBefore: 1800 });
    } else if (w === 3) {
      groups.push({ type: 'SCUTTER', count: 6 + levelId, interval: 1100, delayBefore: 0 });
      groups.push({ type: 'GOBLIN', count: 8, interval: 700, delayBefore: 2000 });
    } else if (w === 4) {
      groups.push({ type: 'GOBLIN', count: 12, interval: 600, delayBefore: 0 });
      groups.push({ type: 'VULTURE', count: 4 + levelId, interval: 1200, delayBefore: 1500 });
    } else if (w === 5) {
      // Mini-Boss
      groups.push({ type: 'GOBLIN', count: 8, interval: 700, delayBefore: 0 });
      groups.push({ type: 'GOLEM', count: levelId >= 2 ? 2 : 1, interval: 3000, delayBefore: 2000 });
      groups.push({ type: 'SCUTTER', count: 5, interval: 1000, delayBefore: 3500 });
    } else if (w < totalWaves - 2) {
      groups.push({ type: 'GOBLIN', count: 14 + w, interval: 500, delayBefore: 0 });
      groups.push({ type: 'SCUTTER', count: 6 + w, interval: 850, delayBefore: 1200 });
      groups.push({ type: 'VULTURE', count: 4 + w, interval: 950, delayBefore: 2000 });
      groups.push({ type: 'GOLEM', count: 1 + Math.floor(w * 0.25), interval: 2500, delayBefore: 3000 });
    } else if (w < totalWaves) {
      groups.push({ type: 'SCUTTER', count: 12, interval: 700, delayBefore: 0 });
      groups.push({ type: 'VULTURE', count: 8, interval: 850, delayBefore: 1200 });
      groups.push({ type: 'GOLEM', count: 3, interval: 2000, delayBefore: 2500 });
      if (levelId >= 2) {
        groups.push({ type: 'MUMMY', count: 1, interval: 0, delayBefore: 4000 });
      }
    } else {
      // Final Boss Wave per Level
      if (levelId === 1) {
        groups.push({ type: 'GOLEM', count: 2, interval: 2000, delayBefore: 0 });
        groups.push({ type: 'SORCERER', count: 1, interval: 0, delayBefore: 2500 });
        groups.push({ type: 'GOBLIN', count: 16, interval: 400, delayBefore: 4500 });
      } else if (levelId === 2) {
        groups.push({ type: 'GOLEM', count: 3, interval: 1800, delayBefore: 0 });
        groups.push({ type: 'MUMMY', count: 1, interval: 0, delayBefore: 3000 });
        groups.push({ type: 'VULTURE', count: 12, interval: 600, delayBefore: 4500 });
      } else {
        // Level 3: Dual Boss - Sorcerer + Mummy Pharaoh + Golem Army
        groups.push({ type: 'GOLEM', count: 4, interval: 1600, delayBefore: 0 });
        groups.push({ type: 'SORCERER', count: 1, interval: 0, delayBefore: 2500 });
        groups.push({ type: 'MUMMY', count: 1, interval: 0, delayBefore: 4500 });
        groups.push({ type: 'SCUTTER', count: 15, interval: 450, delayBefore: 6000 });
      }
    }

    waves.push({
      waveNumber: w,
      groups,
      rewardBonus: 40 + w * 15,
      isBossWave: isBoss
    });
  }

  return waves;
}
