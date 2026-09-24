import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { CITY_LABEL, CLOCK_TICK_MS, WEATHER_REFRESH_MS } from '../constants/config';
import { fetchWeather } from '../utils/api';
import { getWeatherIcon } from '../utils/weatherIcons';

/**
 * Kleines Moschee-Silhouetten-Logo (SVG), angelehnt an Anhang-Bild 1.
 * Als eigene, kleine Unterkomponente statt Bild-Asset, damit die Farbe
 * jederzeit über COLORS.gold gesteuert werden kann und kein zusätzliches
 * Binär-Asset gepflegt werden muss.
 */

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function Header() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState({ temperature: null, weatherCode: null });

  // Live-Uhrzeit: jede Sekunde aktualisieren
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const loadWeather = useCallback(async () => {
    try {
      const result = await fetchWeather();
      setWeather(result);
    } catch (err) {
      // Netzwerkfehler still ignorieren - alter Wert bleibt sichtbar
      console.warn('Wetter konnte nicht geladen werden:', err?.message);
    }
  }, []);

  useEffect(() => {
    loadWeather();
    const id = setInterval(loadWeather, WEATHER_REFRESH_MS);
    return () => clearInterval(id);
  }, [loadWeather]);

  const icon = getWeatherIcon(weather.weatherCode, now);

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        <FontAwesome5 name="mosque" size={40} color="white" />
      </View>

      <View style={styles.center}>
        <Text style={styles.cityText}>{CITY_LABEL}</Text>
      </View>

      <View style={[styles.side, styles.rightSide]}>
        <Text style={styles.timeText}>{formatTime(now)}</Text>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.tempText}>
          {weather.temperature !== null ? `${weather.temperature}°C` : '--°C'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSide: {
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  cityText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    letterSpacing: 4,
  },
  timeText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  icon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  tempText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
