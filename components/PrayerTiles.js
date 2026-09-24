import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';
import { getTranslation, isRTL } from '../utils/translations';

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
    flex: 1,
    minHeight: 70,
    marginHorizontal: 2,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: 2,
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
    fontSize: FONT_SIZES.xs,
    marginBottom: 2,
    textAlign: 'center',
  },
  time: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.sm + 2,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  nextText: {
    color: COLORS.textPrimary,
  },
});