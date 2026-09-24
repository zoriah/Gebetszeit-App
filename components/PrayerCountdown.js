import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';
import { formatCountdown } from '../utils/prayerTimeUtils';
import globalStyles from '../styles/globalStyles';
// GEÄNDERT: getTranslation & isRTL kommen aus utils/translations, nicht aus config!
import { getTranslation, isRTL } from '../utils/translations';

export default function PrayerCountdown({ now, nextTime, hijriText, gregorianText }) {
  const remainingSeconds = useMemo(() => {
    if (!nextTime) return 0;
    return (nextTime.getTime() - now.getTime()) / 1000;
  }, [now, nextTime]);

  // Holt sich automatisch das richtige Wörterbuch für die aktive Sprache
  const t = getTranslation();
  const countdownLabel = t.timeRemaining || t.countdownLabel || 'Verbleibende Zeit';

  return (
    <View style={styles.container}>
      {/* Dynamisches Label je nach Sprache */}
      <Text style={[globalStyles.sectionLabel, styles.label, isRTL && styles.rtlText]}>
        {countdownLabel}
      </Text>

      <LinearGradient
        colors={[COLORS.countdownStart, COLORS.countdownEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.box, globalStyles.shadowCard]}
      >
        <Text style={styles.countdownText}>{formatCountdown(remainingSeconds)}</Text>
      </LinearGradient>

      <View style={styles.dateRow}>
        <Text style={styles.dateText} numberOfLines={1} adjustsFontSizeToFit>
          {hijriText}
          {hijriText && gregorianText ? '  •  ' : ''}
          {gregorianText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
  },
  label: {
    textAlign: 'center',
    marginBottom: SPACING.xs,
    fontSize: FONT_SIZES.sm,
  },
  rtlText: {
    textAlign: 'right',
  },
  box: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.hero,
    fontWeight: '700',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  dateRow: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});