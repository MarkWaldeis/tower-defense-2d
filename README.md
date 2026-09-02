# 🏰 Kingdom Frontiers — 2D Mobile Tower Defense

Ein handgezeichnetes 2D Fantasy Tower Defense Spiel im **Kingdom Rush Frontiers** Stil, optimiert für Mobilgeräte (iOS & Android) und Web-Browser.

🎮 **Direkt im Browser spielen:** [https://markwaldeis.github.io/tower-defense-2d/](https://markwaldeis.github.io/tower-defense-2d/)

---

## 🗺️ Kampagnen-Weltkarte (Overworld Map)
- **Interaktive Wüsten-Weltkarte:** Al-Kharid Wüstenkontinent mit Sanddünen, Gebirgskämmen, Oasen, Ruinen und Sonnenpyramiden.
- **Level-Pfade & Fahnen:** Gestrichelte Pfadverbindungen zu Stufe 1 ("Sonnental-Ruinen & Oase"), Stufe 2 ("Knochen-Canyon") und Stufe 3 ("Sonnen-Pyramide").
- **3-Sterne-System & Highscores:** Übersicht aller gesammelten Sterne und Rekorde pro Sektor.

---

## 🏜️ Stufe 1: Sonnental-Ruinen & Oase
- **Handgezeichnetes Terrain:**
  * Sandstein-Schlucht mit antiken römischen Tempeln ("Tempel der Sonne", "Ruinen von Ra").
  * Schimmernde Wasser-Oase im Zentrum mit Palmen und Kakteen.
  * Gewundener Wüstenpfad mit Spawn-Höhle und Festungs-Ausgang.
- **Feste Turm-Fundamente:**
  * 9 strategisch platzierte Stein-Plinthen entlang des Chokepoints.
  * Klick auf ein Fundament öffnet das Radial-Baumenü für die 4 Fantasy-Türme.

---

## 🏹 4 Legendäre Turm-Klassen
1. **🏹 Steinschleuder-Wachturm (Basic Slinger / Archer):** Hölzerner Ausguck mit schnellen Schleudersteinen und Pfeilen.
2. **⚔️ Armbrust-Bastion (Crossbow Emplacement):** Verstärkte Stein-Festung mit schweren durchschlagenden Bolzen.
3. **🔮 Runen-Magier (Rune Mage):** Arkaner Altar mit magischen Energiebällen (ignoriert physische Rüstung).
4. **🐉 Drachen-Mörser (Heavy Dragon Mortar):** Schwere Drachenmaul-Artillerie mit riesigem Flächenschaden (AoE).

---

## ⚡ Spezialfähigkeiten & Spells
- ⚡ **Kettenblitz:** Klicke auf das Blitz-Icon und tippe auf einen beliebigen Punkt auf der Karte, um Feinde mit vernichtenden Elektro-Bögen zu zerschlagen.

---

## 👹 Wüstenkreaturen & Bosse
- 👺 **Sand-Goblin:** Flinker Wüstenräuber mit Spitzhacke.
- 🦂 **Riesen-Dünenskorpion:** Gepanzerter Chitin-Krabbler.
- 🗿 **Antiker Stein-Golem:** Massiver Ruinen-Koloss mit hoher Rüstung.
- 🦅 **Geier-Reiter:** Schnelle Späher aus der Luft.
- 🧙‍♂️ **Wüsten-Zauberer:** Arkaner Endboss der Wüste.

---

## 🛠️ Lokale Entwicklung & Export

```bash
# Entwicklungsserver starten
npm run dev

# Produktions-Build erstellen
npm run build

# Android App starten (Capacitor)
npx cap add android
npx cap open android
```

---

## 📄 Lizenz
MIT License © 2026 Mark Waldeis
