// Abstände, Ecken-Radien und Schriftgrößen
export const SPACING = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 20,
};

export const FONT_SIZES = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
  xxl: 48,
  hero: 56,
};

// Spezifische Styling-Vorgaben für den Vers des Tages
export const VERSE_THEME = {
  titleSize: FONT_SIZES.xs,
  textSize: FONT_SIZES.xs + 1,
  textLineHeight: (FONT_SIZES.xs + 1) * 1.4,
  referenceSize: FONT_SIZES.xs - 2,
  paddingHorizontal: SPACING.sm,
  paddingVertical: SPACING.xs,
  marginBottomTitle: SPACING.xs,
};

export const COLORS = {
  background: '#0b0f1f',
  backgroundAlt: '#0f1530',
  headerBackground: '#090c18',

  card: 'rgba(255,255,255,0.055)',
  cardBorder: 'rgba(255,255,255,0.09)',
  cardSolid: '#171d38',

  accentBlue: '#1f6feb',
  accentBlueLight: '#4dabf7',
  accentCyan: '#38bdf8',
  gold: '#e8c477',

  countdownStart: '#1c63e0',
  countdownEnd: '#2f8bf0',

  activeStart: '#f6c453',
  activeEnd: '#eea23a',
  activeText: '#241703',

  nextBorder: '#38bdf8',
  nextGlow: 'rgba(56,189,248,0.18)',

  textPrimary: '#f5f7ff',
  textSecondary: '#a2a9c6',
  textMuted: '#666f92',

  verseAccent: '#4dabf7',
  divider: 'rgba(255,255,255,0.08)',
  shadow: '#000000',
};