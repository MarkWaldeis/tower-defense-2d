# 🛡️ Tower Defense 2D — Mobile & Web Strategy

Ein modernes, taktisches 2D Tower Defense Spiel, von Grund auf optimiert für Mobilgeräte (iOS & Android) und Web-Browser. Ausgestattet mit einem **Apple "Liquid Glass" Glassmorphism HUD**, 5 ausbalancierten Turmtypen, FSM-Gegnerlogik, partikelreichem Game Juice, prozeduralem WebAudio-Synthesizer und CI/CD GitHub Pages Deployment.

🎮 **Direkt im Browser spielen:** [https://markwaldeis.github.io/tower-defense-2d/](https://markwaldeis.github.io/tower-defense-2d/)

---

## 📱 Highlights & Mobile-First Features

- **Apple Liquid Glass HUD:** Elegante, milchige Glas-Overlays (`backdrop-filter: blur`), Neon-Indikatoren und taktile Touch-Elemente.
- **Mobile Touch-Bedienung:** Intuitive Turm-Platzierung per Tap, Reichweiten-Kreise mit Live-Highlight, Safe-Area-Handling für iPhone-Notches & Android-Statusleisten.
- **5 Spezialisierte Türme:**
  - 🔫 **Gatling-Geschütz:** Schnellfeuer gegen Schwärme & schnelle Aufklärer.
  - ⚡ **Plasma-Laser:** Kontinuierlicher Hochenergiestrahl mit Rüstungsdurchdringung.
  - 🚀 **Raketen-Silo:** Flächenschaden (AoE) mit Zielsuchlenkung.
  - ❄️ **Kryo-Emitter:** Verlangsamt Feinde im Umkreis um 50%.
  - 🔮 **Tesla-Spule:** Kettenblitz springt auf bis zu 4 nahe Feinde über.
- **5 Targeting-Modi:** `ERSTER`, `LETZTER`, `STÄRKSTER`, `SCHWÄCHSTER`, `NÄCHSTER` pro Turm umschaltbar.
- **Multi-Tier Upgrade-System:** 3 Ausbaustufen (MK-I, MK-II, MK-III) mit Schadens- und Reichweiten-Boni sowie Rückerstattung beim Verkauf.
- **High-Performance Object-Pooling:** Null Garbage-Collection-Stottern durch Voraballokation von Kugeln, Raketen und Partikeln.
- **Prozeduraler WebAudio-Synthesizer:** Satter Sound für Laser, Explosionen, Klicks und Synth-BGM direkt über die Web Audio API – ohne externe Asset-Ladefehler.
- **Speicher-System:** Auto-Save im LocalStorage für Level-Fortschritte, 3-Sterne-Bewertungen, Highscores und Statistiken.

---

## 🛠️ Tech Stack & Architektur

```
tower-defense-2d/
├── .github/workflows/deploy.yml     # Automatisches GitHub Pages Deployment
├── public/
│   ├── favicon.svg                  # App-Icon & Vektor-Favicon
│   └── manifest.json                # PWA-Manifest für Homescreen-Installation
├── src/
│   ├── audio/SoundSynthesizer.ts    # Reiner WebAudio SFX & BGM Generator
│   ├── config/GameConfig.ts         # Balance-Werte, Maps, Turm- & Gegner-Stats
│   ├── entities/
│   │   ├── towers/Tower.ts          # Turm-Container, Waffensysteme & Targeting
│   │   ├── enemies/Enemy.ts         # Gegner-Wegpunkt-Navigation & Rüstung
│   │   └── projectiles/             # Bullet-, Raketen- & Laser-Pooling
│   ├── scenes/
│   │   ├── BootScene.ts             # Prozedurale HD-Vektortexturen-Generierung
│   │   ├── MainMenuScene.ts         # Animiertes Cyber-Hauptmenü
│   │   ├── LevelSelectScene.ts      # Missions-Auswahl mit Sternen-Status
│   │   ├── GameScene.ts             # Hauptspielschleife, Grid & Kamera
│   │   └── UIScene.ts               # Apple Glass HUD & Steuerungs-Events
│   ├── systems/
│   │   ├── GridManager.ts           # Kachelgitter, Pfade & Baufelder
│   │   ├── WaveManager.ts           # Wellen-Orchestrierung & Boss-Warnung
│   │   ├── JuiceManager.ts          # Floating Numbers, Screen Shake & FX
│   │   └── SaveManager.ts           # LocalStorage Persistenz
│   ├── styles/glass-ui.css          # Liquid Glass Design Tokens & Media Queries
│   └── main.ts                      # Phaser Game Initialisierung & Resize-Listener
├── capacitor.config.ts              # iOS / Android Native Wrapper Config
└── vite.config.ts                   # Vite Bundler Konfiguration
```

---

## 🚀 Lokale Entwicklung

### 1. Abhängigkeiten installieren
```bash
npm install
```

### 2. Entwicklungsserver starten
```bash
npm run dev
```
Öffnet automatisch `http://localhost:3000` im Browser.

### 3. Produktions-Build erstellen
```bash
npm run build
```

---

## 📲 Export für iOS & Android (Capacitor)

Das Projekt ist für den nativen Export über **Capacitor** vorkonfiguriert:

### Android Studio Build
```bash
npm run build
npx cap add android
npx cap open android
```

### iOS Xcode Build (macOS)
```bash
npm run build
npx cap add ios
npx cap open ios
```

---

## 📄 Lizenz
MIT License © 2026 Mark Waldeis
