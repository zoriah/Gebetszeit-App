import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';
import { getTranslation, isRTL } from '../utils/translations';

// Ermittelt die exakte Breite des TV-Bildschirms im Querformat für eine stabile Aufteilung
const { width: screenWidth } = Dimensions.get('window');

// Mapping-Tabelle: Verknüpft Diyanet-Keys mit den Schlüsseln aus translations.js
const KEY_MAP = {
  imsak: 'fajr',
  gunes: 'sunrise',
  ogle: 'dhuhr',
  ikindi: 'asr',
  aksam: 'maghrib',
  yatsi: 'isha',
};

function formatHHMM(date) {
  if (!date) return '--:--';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function PrayerTiles({ times, activeIndex, nextIndex }) {
  const t = getTranslation();

  // Sicherheitsabfrage für Android TV, falls das Array beim asynchronen Start kurz leer ist
  if (!times || !Array.isArray(times) || times.length === 0) return null;

  return (
    <View style={[styles.row, isRTL && styles.rowRTL]}>
      {times.map((item, index) => {
        const isActive = index === activeIndex;
        const isNext = index === nextIndex;

        // Sicherer Lookup: Prüft den direkten Key ODER das Mapping
        const translationKey = KEY_MAP[item.key] || item.key;
        const translatedLabel = t[translationKey] || t[item.key] || item.label;

        const tileContent = (
          <>
            <Text 
              style={[
                styles.label, 
                isActive && { color: COLORS.activeText },
                isNext && styles.nextText
              ]} 
              numberOfLines={1} 
              adjustsFontSizeToFit
            >
              {translatedLabel}
            </Text>
            <Text 
              style={[
                styles.time, 
                isActive && { color: COLORS.activeText },
                isNext && styles.nextText
              ]}
            >
              {formatHHMM(item.time)}
            </Text>
          </>
        );

        if (isActive) {
          return (
            <LinearGradient
              key={item.key || index}
              colors={[COLORS.activeStart, COLORS.activeEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.tile, styles.activeTile]}
            >
              {tileContent}
            </LinearGradient>
          );
        }

        return (
          <View
            key={item.key || index}
            style={[
              styles.tile,
              styles.defaultTile,
              isNext && styles.nextTile,
            ]}
          >
            {tileContent}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  tile: {
    // FIX FÜR TV: Statt "flex: 1" berechnen wir die exakte Breite für 6 Kacheln im Querformat,
    // damit das Layout auf Google TV unter keinen Umständen horizontal oder vertikal kollabiert.
    width: (screenWidth - 100) / 6,
    height: 120, // Feste Höhe garantiert Sichtbarkeit auf dem TV-Chip
    marginHorizontal: 4,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultTile: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  activeTile: {
    borderWidth: 0,
  },
  nextTile: {
    borderWidth: 2,
    borderColor: COLORS.nextBorder,
    backgroundColor: COLORS.nextGlow,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.xs + 4, // Leicht erhöht für bessere Lesbarkeit auf dem TV-Bildschirm
    marginBottom: 4,
    textAlign: 'center',
  },
  time: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.sm + 8, // Leicht erhöht für die TV-Distanz (Couch-Ansicht)
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  nextText: {
    color: COLORS.textPrimary,
  },
});
