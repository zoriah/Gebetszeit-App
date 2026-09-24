import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, StatusBar } from 'react-native';
import Header from './components/Header';
import PrayerCountdown from './components/PrayerCountdown';
import PrayerTiles from './components/PrayerTiles';
import VerseOfTheDay from './components/VerseOfTheDay';
import AdSlider from './components/AdSlider';
import { fetchPrayerTimes, fetchWeather } from './utils/api';
import { COLORS } from './constants/theme';

export default function App() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrayer, setCurrentPrayer] = useState('');
  const [nextPrayer, setNextPrayer] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [nextIndex, setNextIndex] = useState(-1);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Lädt das Jahres-Array aus deiner api.js
        const allYearTimes = await fetchPrayerTimes();
        const weather = await fetchWeather();
        
        // Ermittelt das heutige Datum passend zu deiner Struktur
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const todayString = `${day}.${month}.${year}`;

        // Sucht den heutigen Tag aus dem Array
        const todayTimes = allYearTimes.find(item => item.MiladiTarihKisa === todayString);
        
        if (todayTimes) {
          // Hier transformieren wir das Diyanet-Objekt in das strukturierte Array,
          // welches deine PrayerTiles.js mit (.key, .label, .time) erwartet!
          const formattedTimes = [
            { key: 'imsak', label: 'Imsak', time: parseTimeStr(todayTimes.Imsak) },
            { key: 'gunes', label: 'Güneş', time: parseTimeStr(todayTimes.Gunes) },
            { key: 'ogle', label: 'Öğle', time: parseTimeStr(todayTimes.Ogle) },
            { key: 'ikindi', label: 'İkindi', time: parseTimeStr(todayTimes.Ikindi) },
            { key: 'aksam', label: 'Akşam', time: parseTimeStr(todayTimes.Aksam) },
            { key: 'yatsi', label: 'Yatsı', time: parseTimeStr(todayTimes.Yatsi) },
          ];
          
          setPrayerTimes(formattedTimes);
          
          // Ermittle aktives/nächstes Gebet (Beispielhaft auf Index 2 gesetzt)
          setActiveIndex(2); 
          setNextIndex(3);
        }
        
        setWeatherData(weather);

      } catch (error) {
        console.error("Fehler beim Laden der TV-Daten:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Hilfsfunktion, um die "HH:MM"-Strings in echte Date-Objekte für dein formatHHMM() zu wandeln
  function parseTimeStr(timeStr) {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    return d;
  }

  // Verhindert das fehlerhafte TV-Rendering bei leeren Daten
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.activeStart || "#00adb5"} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      <Header weather={weatherData} />

      <View style={styles.middleSection}>
        <View style={styles.countdownWrapper}>
          <PrayerCountdown prayerTimes={prayerTimes} nextIndex={nextIndex} />
        </View>
        <View style={styles.verseWrapper}>
          <VerseOfTheDay />
        </View>
      </View>

      {/* Deine originale Komponente mit exakter Datenübergabe */}
      <PrayerTiles 
        times={prayerTimes} 
        activeIndex={activeIndex} 
        nextIndex={nextIndex} 
      />

      <AdSlider />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f1f',
    paddingHorizontal: 30,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  countdownWrapper: {
    flex: 1,
    marginRight: 15,
  },
  verseWrapper: {
    flex: 1,
    marginLeft: 15,
  },
});
