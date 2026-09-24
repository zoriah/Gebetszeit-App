import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '../constants/theme';

/**
 * globalStyles.js
 * ---------------------------------------------------------------------------
 * Wiederverwendbare Basis-Styles, die von mehreren Komponenten genutzt
 * werden (Karten, Container, Texte). Komponenten-spezifische Feinheiten
 * bleiben in der jeweiligen Komponentendatei, damit globalStyles schlank
 * bleibt.
 * ---------------------------------------------------------------------------
 */
const globalStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  row: {
    flexDirection: 'row',
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.sm,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  textPrimary: {
    color: COLORS.textPrimary,
  },
  textSecondary: {
    color: COLORS.textSecondary,
  },
  textMuted: {
    color: COLORS.textMuted,
  },
  shadowCard: Platform.select({
    web: {
      boxShadow: `0px 6px 12px ${COLORS.shadow || 'rgba(0, 0, 0, 0.35)'}`,
    },
    default: {
      shadowColor: COLORS.shadow || '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 6,
    },
  }),
});

export default globalStyles;