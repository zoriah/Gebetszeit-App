import { APP_LANGUAGE } from '../constants/config';

export const TRANSLATIONS = {
  de: {
    // Countdown
    nextPrayer: 'Nächstes Gebet',
    timeRemaining: 'Verbleibende Zeit',

    // Kacheln
    prayerTimesTitle: 'Gebetszeiten',
    weatherTitle: 'Wetter',
    verseTitle: 'Vers des Tages',

    // Gebetszeiten (Englische Keys)
    fajr: 'Morgen',
    sunrise: 'Sonnenaufgang',
    dhuhr: 'Dhuhr',
    asr: 'Nachmittag',
    maghrib: 'Abend',
    isha: 'Nacht',

    // Gebetszeiten (Diyanet-Keys)
    imsak: 'Morgen',
    gunes: 'Sonnenaufgang',
    ogle: 'Dhuhr',
    ikindi: 'Nachmittag',
    aksam: 'Abend',
    yatsi: 'Nacht',
  },
  tr: {
    // Countdown
    nextPrayer: 'Sıradaki Vakit',
    timeRemaining: 'Kalan Süre',

    // Kacheln
    prayerTimesTitle: 'Namaz Vakitleri',
    weatherTitle: 'Hava Durumu',
    verseTitle: 'Günün Ayeti',

    // Gebetszeiten (Englische Keys)
    fajr: 'İmsak',
    sunrise: 'Güneş',
    dhuhr: 'Öğle',
    asr: 'İkindi',
    maghrib: 'Akşam',
    isha: 'Yatsı',

    // Gebetszeiten (Diyanet-Keys)
    imsak: 'İmsak',
    gunes: 'Güneş',
    ogle: 'Öğle',
    ikindi: 'İkindi',
    aksam: 'Akşam',
    yatsi: 'Yatsı',
  },
  ar: {
    // Countdown
    nextPrayer: 'الصلاة القادمة',
    timeRemaining: 'الوقت المتبقي',

    // Kacheln
    prayerTimesTitle: 'مواقيت الصلاة',
    weatherTitle: 'الطقس',
    verseTitle: 'آية اليوم',

    // Gebetszeiten (Englische Keys)
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',

    // Gebetszeiten (Diyanet-Keys)
    imsak: 'الفجر',
    gunes: 'الشروق',
    ogle: 'الظهر',
    ikindi: 'العصر',
    aksam: 'المغرب',
    yatsi: 'العشاء',
  },
};

// Zweitname für Abwärtskompatibilität
export const DEFAULT_LABELS = TRANSLATIONS;

export const getTranslation = () => {
  return TRANSLATIONS[APP_LANGUAGE] || TRANSLATIONS.de;
};

/**
 * Gibt true zurück, wenn die Sprache von rechts nach links gelesen wird (z. B. Arabisch).
 */
export const isRTL = APP_LANGUAGE === 'ar';