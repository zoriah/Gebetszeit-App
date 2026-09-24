import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, VERSE_THEME } from '../constants/theme';
import { APP_LANGUAGE } from '../constants/config';
import { getTranslation, isRTL } from '../utils/translations';
import { pickVerseForDate } from '../utils/verses';
import globalStyles from '../styles/globalStyles';

const STORAGE_KEY = `gebetsapp:verseOfTheDay:${APP_LANGUAGE}`;
const PREVIOUS_VERSE_KEY = `gebetsapp:previousVerseReference:${APP_LANGUAGE}`;

function todayKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export default function VerseOfTheDay() {
  const [verse, setVerse] = useState(null);

  const t = getTranslation();
  const verseTitle = t.verseTitle || 'Vers des Tages';

  const refreshVerse = useCallback(async () => {
    const now = new Date();
    const key = todayKey(now);

    try {
      const cachedRaw = await AsyncStorage.getItem(STORAGE_KEY);
      const cached = cachedRaw ? JSON.parse(cachedRaw) : null;

      if (cached && cached.dateKey === key) {
        setVerse(cached.verse);
        return;
      }

      let fresh = await pickVerseForDate(APP_LANGUAGE);
      const previousRef = await AsyncStorage.getItem(PREVIOUS_VERSE_KEY);

      if (previousRef && fresh.reference === previousRef) {
        fresh = await pickVerseForDate(APP_LANGUAGE);
      }

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ dateKey: key, verse: fresh })
      );
      await AsyncStorage.setItem(PREVIOUS_VERSE_KEY, fresh.reference);

      setVerse(fresh);
    } catch (err) {
      console.warn('Fehler beim Aktualisieren des Verses:', err);
      const fallbackVerse = await pickVerseForDate(APP_LANGUAGE);
      setVerse(fallbackVerse);
    }
  }, []);

  useEffect(() => {
    refreshVerse();

    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    );
    const msToMidnight = nextMidnight.getTime() - now.getTime();

    const timerId = setTimeout(() => {
      refreshVerse();
    }, msToMidnight);

    return () => clearTimeout(timerId);
  }, [refreshVerse]);

  if (!verse) return null;

  return (
    <View style={[globalStyles.card, styles.wrapper, isRTL && styles.wrapperRTL]}>
      <View style={styles.accentBar} />
      <View style={styles.content}>
        <Text 
          allowFontScaling={false}
          style={[globalStyles.sectionLabel, styles.title, isRTL && styles.textRTL]}
        >
          {verseTitle}
        </Text>
        <ScrollView
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}
        >
          <Text allowFontScaling={false} style={[styles.text, isRTL && styles.textRTL]}>
            {verse.text}
          </Text>
          <Text allowFontScaling={false} style={[styles.reference, isRTL && styles.referenceRTL]}>
            — {verse.reference}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    overflow: 'hidden',
    paddingLeft: 0,
    maxHeight: 180, // Schützt vor Überlappung der Gebetskacheln nach oben
  },
  wrapperRTL: {
    flexDirection: 'row-reverse',
    paddingLeft: undefined,
    paddingRight: 0,
  },
  accentBar: {
    width: 4,
    backgroundColor: COLORS.verseAccent,
  },
  content: {
    flex: 1,
    paddingHorizontal: VERSE_THEME.paddingHorizontal,
    paddingVertical: VERSE_THEME.paddingVertical,
  },
  scrollArea: {
    flexGrow: 0,
  },
  title: {
    color: COLORS.verseAccent,
    fontSize: VERSE_THEME.titleSize,
    marginBottom: VERSE_THEME.marginBottomTitle,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: VERSE_THEME.textSize,
    fontStyle: 'italic',
    lineHeight: VERSE_THEME.textLineHeight,
  },
  textRTL: {
    textAlign: 'right',
  },
  reference: {
    color: COLORS.textMuted,
    fontSize: VERSE_THEME.referenceSize,
    marginTop: 4,
    textAlign: 'right',
  },
  referenceRTL: {
    textAlign: 'left',
  },
});