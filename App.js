import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';

import Header from './components/Header';
import PrayerCountdown from './components/PrayerCountdown';
import PrayerTiles from './components/PrayerTiles';
import VerseOfTheDay from './components/VerseOfTheDay';
import AdSlider from './components/AdSlider';

import { COLORS, SPACING } from './constants/theme';
import { CLOCK_TICK_MS } from './constants/config';
import { fetchPrayerTimes } from './utils/api';
import { initNetworkLogger } from './utils/networkLogger';
import {
  buildPrayerTimesForDay,
  computePrayerStatus,
  findEntryForDate,
  formatGregorianGerman,
  formatHijriGerman,
} from './utils/prayerTimeUtils';
import globalStyles from './styles/globalStyles';

// WebSocket-Adresse deines Node.js-Servers
const WS_URL = 'ws://100.82.7.57:8082';

export default function App() {
  // Zum Testen, wie oft welche API ausgeführt wird.
  initNetworkLogger();

  // Verhindert TCL Bildschirmschoner
  useKeepAwake();

  // Dynamische Ermittlung der Bildschirmabmessungen
  const { width, height } = useWindowDimensions();

  // State für die gewählte Sprache (Standard: 'de')
  const [currentLanguage, setCurrentLanguage] = useState('de');

  // Sekundentakt
  const [now, setNow] = useState(new Date());

  // WebSocket-Verbindung für Live-Anweisungen vom Configurator
  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('=== WEBSOCKET VERBUNDEN (Port 8082) ===');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.language) {
            console.log(`========================================`);
            console.log(`[TV APP] SUCCESS: Sprache empfangen -> ${data.language}`);
            console.log(`========================================`);

            setCurrentLanguage(data.language);
          }
        } catch (err) {
          console.warn('Fehler beim Parsen der WebSocket-Nachricht:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket Fehler:', err?.message);
      };

      ws.onclose = () => {
        console.log('WebSocket Verbindung getrennt.');
      };
    } catch (err) {
      console.warn('WebSocket Initialisierungsfehler:', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Protokolliert Gerätedaten und Bildschirmmaße
  useEffect(() => {
    console.log('=== DEVICE & SCREEN INFO ===');
    console.log(`OS: ${Platform.OS} (Version: ${Platform.Version})`);
    console.log(`Screen Width: ${width}px`);
    console.log(`Screen Height: ${height}px`);
    console.log('============================');
  }, [width, height]);

  // Dynamische Berechnung der linken Spaltenbreite
  const leftColumnWidth = useMemo(() => {
    return Math.round(width * 0.6);
  }, [width]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Rohdaten der Gebetszeiten-API
  const [entries, setEntries] = useState([]);

  const loadPrayerTimes = useCallback(async () => {
    try {
      const data = await fetchPrayerTimes();
      setEntries(data);
    } catch (err) {
      console.warn(`Gebetszeiten konnten nicht geladen werden: ${err?.message}`);
    }
  }, []);

  useEffect(() => {
    loadPrayerTimes();
    const id = setInterval(loadPrayerTimes, 24 * 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [loadPrayerTimes]);

  // Heutigen & morgigen Tagesdatensatz heraussuchen
  const todayEntry = useMemo(() => findEntryForDate(entries, now), [entries, now]);
  const tomorrowEntry = useMemo(() => {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return findEntryForDate(entries, tomorrow);
  }, [entries, now]);

  const todayTimes = useMemo(
    () => buildPrayerTimesForDay(todayEntry, now) ?? [],
    [todayEntry, now],
  );

  const tomorrowFirstTime = useMemo(() => {
    if (!tomorrowEntry) return null;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const built = buildPrayerTimesForDay(tomorrowEntry, tomorrow);
    return built ? built[0].time : null;
  }, [tomorrowEntry, now]);

  const { activeIndex, nextIndex, nextTime } = useMemo(
    () => computePrayerStatus(now, todayTimes, tomorrowFirstTime),
    [now, todayTimes, tomorrowFirstTime],
  );

  const hijriText = useMemo(
    () => (todayEntry ? formatHijriGerman(todayEntry.HicriTarihKisa) : ''),
    [todayEntry],
  );
  const gregorianText = useMemo(() => formatGregorianGerman(now), [now]);

  return (
    <View style={globalStyles.screen}>
      <StatusBar hidden />
      <Header currentLanguage={currentLanguage} />

      <View style={styles.body}>
        <View style={[styles.leftColumn, { width: leftColumnWidth }]}>
          <PrayerCountdown
            now={now}
            nextTime={nextTime}
            hijriText={hijriText}
            gregorianText={gregorianText}
            currentLanguage={currentLanguage}
          />

          <View style={styles.tilesWrapper}>
            <PrayerTiles
              times={todayTimes}
              activeIndex={activeIndex}
              nextIndex={nextIndex}
              currentLanguage={currentLanguage}
            />
          </View>

          <View style={styles.verseWrapper}>
            <VerseOfTheDay currentLanguage={currentLanguage} />
          </View>
        </View>

        <View style={styles.rightColumn}>
          <AdSlider currentLanguage={currentLanguage} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    padding: SPACING.lg,
    justifyContent: 'flex-start', // Richtet Elemente von oben aus
    borderRightWidth: 1,
    borderRightColor: COLORS.divider,
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: SPACING.md,
  },
  tilesWrapper: {
    marginTop: SPACING.lg,
  },
  verseWrapper: {
    marginTop: 'auto', // Zwingt den Vers-Block fest an den unteren Rand der Spalte
    paddingTop: SPACING.md,
  },
});
