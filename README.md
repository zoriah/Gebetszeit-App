# GebetsApp

Info-Bildschirm-App für Gebetszeiten in Berlin, gebaut mit **Expo / React Native / JavaScript**.
Ausgelegt für Anzeige auf einem TCL 55P7K (122,4 × 70,8 cm, Querformat).

## Projektstruktur

```
GebetsApp/
├── assets/                # Icon, Splash-Screen, Adaptive-Icon (generierte Platzhalter)
├── ads/                   # Werbebilder für den Slider (ad1.jpg, ad2.jpg, ...)
├── constants/
│   ├── theme.js           # Farben/Abstände/Radien als zentrale "CSS-Variablen"
│   └── config.js           # Standort, API-IDs, Intervalle
├── components/
│   ├── Header.js           # Logo, Stadtname, Live-Uhrzeit + Live-Wetter
│   ├── PrayerCountdown.js  # Countdown-Box + Datum (hijri/gregorianisch)
│   ├── PrayerTiles.js      # 6 Gebetszeit-Kacheln inkl. aktiv/nächste-Hervorhebung
│   ├── VerseOfTheDay.js    # Vers des Tages (24h-Rotation)
│   └── AdSlider.js         # Werbebilder-Slider (10s Intervall)
├── styles/
│   └── globalStyles.js     # Gemeinsam genutzte Basis-Styles
├── utils/                 # (Ergänzung ggü. Vorgabe, siehe Hinweis unten)
│   ├── api.js               # fetch-Aufrufe (Wetter, Gebetszeiten)
│   ├── prayerTimeUtils.js   # Datum-/Zeit-Berechnungen, Formatierung
│   ├── verses.js            # lokale Vers-Datenbank + Auswahl-Logik
│   └── weatherIcons.js      # WMO-Wettercode -> Icon
├── App.js
├── package.json
├── app.json
├── babel.config.js
└── android/
    └── local.properties
```

> **Hinweis zur Struktur:** Zusätzlich zur vorgegebenen Ordnerhierarchie wurde
> ein `utils/`-Ordner ergänzt. Dort liegt reine, wiederverwendbare Logik
> (API-Aufrufe, Datum/Zeit-Berechnung, Vers-Auswahl) getrennt von den
> UI-Komponenten - das war nötig, um den Code wie gefordert sauber
> "auszulagern", statt Fetch-/Berechnungslogik in den Komponenten selbst zu
> vergraben.

## Installation & Start

```bash
npm install
npx expo start
```

Für ein natives Android-Projekt (z.B. für den TV-Build):

```bash
npx expo prebuild
```

⚠️ **Wichtig:** `expo prebuild` erzeugt den `android/`-Ordner neu und
**überschreibt dabei `android/local.properties`**. Falls das passiert,
einfach die Datei danach wieder mit folgendem Inhalt anlegen:

```properties
sdk.dir=C:\\Users\\NOA35\\AppData\\Local\\Android\\Sdk
ndk.dir=C:\\Users\\NOA35\\AppData\\Local\\Android\\Sdk\\ndk\\27.1.12297006
cmake.dir=C:\\Users\\NOA35\\AppData\\Local\\Android\\Sdk\\cmake\\3.22.1
```

## Verwendete APIs

- **Wetter:** Open-Meteo
  `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m,weather_code`
  Koordinaten (Nostitzstr. 30, Berlin) sind in `constants/config.js` hinterlegt.
- **Gebetszeiten:** ezanvakti.emushaf.net (Diyanet-Datenbasis)
  `https://ezanvakti.emushaf.net/vakitler/9541` (9541 = Berlin, ebenfalls in
  `constants/config.js` konfigurierbar).

## Werbebilder ergänzen

Metro (der Expo-Bundler) kann Bilder nicht zur Laufzeit aus einem Ordner
einlesen - jedes Werbebild muss beim Build bekannt sein:

1. Bilddatei in `ads/` ablegen, z.B. `ads/ad3.jpg`
2. In `components/AdSlider.js` in der `adImages`-Liste ergänzen:
   `require('../ads/ad3.jpg')`

Die Slider-Logik selbst (10-Sekunden-Intervall, Übergang) muss dafür nicht
angepasst werden.

## Farbschema anpassen

Alle Farben liegen zentral in `constants/theme.js`. Dort sind - wie
gewünscht - mehrere alternative Paletten als auskommentierte Blöcke
hinterlegt (u.a. eine Pastell-Variante). Einfach den gewünschten Block
aktivieren.
