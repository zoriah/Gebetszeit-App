/**
 * config.js
 * ---------------------------------------------------------------------------
 * Nicht-visuelle, app-weite Konstanten (Standort, API-IDs, Intervalle).
 * Getrennt von theme.js (Farben/Design), damit beide Dateien fokussiert
 * bleiben.
 * ---------------------------------------------------------------------------
 */

// Sprache (Standard 'de') de, tr, ar
export const APP_LANGUAGE='tr'

// Standort: Nostitzstr. 30, Berlin-Kreuzberg (für Wetter-API)
export const BERLIN_LATITUDE = 52.4912;
export const BERLIN_LONGITUDE = 13.3887;

// Diyanet / ezanvakti.emushaf.net Bezirks-ID für Berlin
export const DIYANET_CITY_ID = '9541';

// Anzeigename im Header
export const CITY_LABEL = 'BERLIN';
// export const COUNTRY_LABEL = 'GERMANY';

// Aktualisierungs-Intervalle (in Millisekunden)
export const CLOCK_TICK_MS = 1000; // Uhrzeit & Countdown: jede Sekunde
export const WEATHER_REFRESH_MS = 60 * 60 * 1000; // Wetter: jede Stunde
export const AD_SLIDE_INTERVAL_MS = 10 * 1000; // Werbe-Slider: alle 10 Sekunden
export const VERSE_CHECK_INTERVAL_MS = 60 * 60 * 1000; // Vers-Rotation: stündlich prüfen (wechselt effektiv alle 24h)

// Wie lange nach Gebetsbeginn die Kachel "aktiv" (gelblich) bleibt
export const ACTIVE_PRAYER_WINDOW_MINUTES = 30;
