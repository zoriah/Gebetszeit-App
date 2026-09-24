// src/utils/networkLogger.js

import { APP_LANGUAGE } from '../constants/config'; // Pfad zu deiner config.js anpassen

// ANSI-Farbcodes für das Entwickler-Terminal
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',   // Standard API / System
  cyan: '\x1b[36m',    // Wetter (Open-Meteo)
  yellow: '\x1b[33m',  // Gebetszeiten (Aladhan)
  magenta: '\x1b[35m', // Vers des Tages
  red: '\x1b[31m',     // Fehler / Warnungen
  bold: '\x1b[1m',
};

/**
 * Prüft die Sprachkonfiguration auf Vollständigkeit
 */
const verifyConfiguration = () => {
  const supportedLanguages = [
    'de', 
    'tr', 
    'ar'
  ];

  const timestamp = new Date().toLocaleTimeString();

  console.log(`${COLORS.bold}${COLORS.green}[SYSTEM CHECK] ${timestamp} ➔ Prüfe Systemkonfiguration...${COLORS.reset}`);

  if (!supportedLanguages.includes(APP_LANGUAGE)) {
    console.log(
      `${COLORS.red}[CONFIG ERROR] Ungültige Sprache '${APP_LANGUAGE}' in config.js! Erlaubt sind: ${supportedLanguages.join(', ')}${COLORS.reset}`
    );
    return false;
  }

  console.log(
    `${COLORS.green}[SYSTEM OK] Sprache '${APP_LANGUAGE.toUpperCase()}' erfolgreich geladen & verifiziert.${COLORS.reset}`
  );
  return true;
};

/**
 * Initialisiert den globalen Fetch-Logger mit Auslesung des Vers-Inhalts im Terminal
 */
export const initNetworkLogger = () => {
  if (global.__fetchLoggerInstalled) return;

  const isConfigValid = verifyConfiguration();
  const originalFetch = global.fetch;

  global.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
    const timestamp = new Date().toLocaleTimeString();

    let color = COLORS.green;
    let label = 'API CALL';
    const isVerseCall = url && (url.includes('verse') || url.includes('quran'));

    if (url) {
      if (url.includes('open-meteo.com')) {
        color = COLORS.cyan;
        label = 'WEATHER';
      } else if (url.includes('aladhan.com') || url.includes('prayer')) {
        color = COLORS.yellow;
        label = 'PRAYER';
      } else if (isVerseCall) {
        color = COLORS.magenta;
        label = `VERSE [${APP_LANGUAGE.toUpperCase()}]`;
      }
    }

    const statusPrefix = isConfigValid ? '' : `${COLORS.red}[WARN] `;
    console.log(`${statusPrefix}${color}[${label}] ${timestamp} ➔ ${url}${COLORS.reset}`);

    // Führe den eigentlichen Netzwerkaufruf aus
    const response = await originalFetch(...args);

    // Speziell für den Vers: Antwort abfangen und den Vers-Text im Terminal ausgeben
    if (isVerseCall && response.ok) {
      try {
        // Response klonen, damit der Stream für die UI-Komponente nicht verbraucht wird
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();

        // Extrahiere den Vers-Text (Pfade an deine API-Struktur anpassen)
        const verseText = data.text || data.data?.text || data.verse || JSON.stringify(data);

        console.log(`${COLORS.magenta} └─ 📖 [VERS INHALT (${APP_LANGUAGE.toUpperCase()})]: "${verseText}"${COLORS.reset}`);
      } catch (err) {
        // Falls die Response kein JSON war, Fehler ignorieren
      }
    }

    return response;
  };

  global.__fetchLoggerInstalled = true;
};