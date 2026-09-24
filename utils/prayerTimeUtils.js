import { ACTIVE_PRAYER_WINDOW_MINUTES, APP_LANGUAGE } from '../constants/config';

/**
 * prayerTimeUtils.js
 * ---------------------------------------------------------------------------
 * Reine Hilfsfunktionen (kein React, kein State) rund um die Gebetszeiten:
 * - Zuordnung Diyanet-API-Feld -> Kachel-Bezeichnung
 * - Finden des heutigen/morgigen Datensatzes in der Jahres-Liste der API
 * - Berechnen von "aktueller" und "nächster" Gebetszeit
 * - Formatieren von Hijri- und gregorianischem Datum (Mehrsprachig: DE, TR, AR)
 * ---------------------------------------------------------------------------
 */

// Reihenfolge & Standard-Beschriftung der 6 Kacheln:
export const PRAYERS = [
  { key: 'imsak', label: 'Morgen', apiField: 'Imsak' },
  { key: 'gunes', label: 'Sonne', apiField: 'Gunes' },
  { key: 'ogle', label: 'Mittag', apiField: 'Ogle' },
  { key: 'ikindi', label: 'Nachmittag', apiField: 'Ikindi' },
  { key: 'aksam', label: 'Abend', apiField: 'Aksam' },
  { key: 'yatsi', label: 'Nacht', apiField: 'Yatsi' },
];

// Mehrsprachige Hijri-Monatsnamen
const HIJRI_MONTHS = {
  de: [
    'Muharram', 'Safar', "Rabi' I", "Rabi' II",
    'Jumada I', 'Jumada II', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhu l-Qi'da", 'Dhu l-Hijja',
  ],
  tr: [
    'Muharrem', 'Sefer', 'Rebiülevvel', 'Rebiülahir',
    'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
    'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce',
  ],
  ar: [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
  ],
};

const LOCALE_MAP = {
  de: 'de-DE',
  tr: 'tr-TR',
  ar: 'ar-SA',
};

/** Formatiert ein Date-Objekt als "TT.MM.JJJJ", wie es die API als Schlüssel benutzt. */
export function formatDateKey(date) {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

/** 
 * Sucht in der von der API gelieferten Liste (über mehrere Monate) den Datensatz für ein bestimmtes Datum.
 * Robuster Zahlenvergleich schützt vor Abweichungen bei führenden Nullen (z.B. "1.9.2026" vs "01.09.2026").
 */
export function findEntryForDate(entries, date) {
  if (!Array.isArray(entries) || entries.length === 0 || !date) return null;

  const targetDay = date.getDate();
  const targetMonth = date.getMonth() + 1;
  const targetYear = date.getFullYear();

  return entries.find((entry) => {
    if (!entry || !entry.MiladiTarihKisa) return false;
    const parts = entry.MiladiTarihKisa.split('.').map((n) => parseInt(n, 10));
    if (parts.length !== 3) return false;
    const [eDay, eMonth, eYear] = parts;
    return eDay === targetDay && eMonth === targetMonth && eYear === targetYear;
  }) ?? null;
}

/** Wandelt "HH:MM" + Basis-Datum in ein konkretes Date-Objekt für diesen Tag um. */
export function timeStringToDate(baseDate, hhmm) {
  if (!hhmm || typeof hhmm !== 'string' || !hhmm.includes(':')) return null;
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  const d = new Date(baseDate);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Baut aus einem Tagesdatensatz ein Array von 6 { ...PRAYERS[i], time: Date } auf. */
export function buildPrayerTimesForDay(entry, baseDate) {
  if (!entry) return [];
  return PRAYERS.map((p) => ({
    ...p,
    time: timeStringToDate(baseDate, entry[p.apiField]),
  }));
}

/**
 * Ermittelt anhand der aktuellen Uhrzeit:
 * - activeIndex: Index der Kachel, deren Gebetszeit vor <= 30 Min. begonnen hat (oder null)
 * - nextIndex: Index der als nächstes anstehenden Kachel (kann auf morgen zeigen)
 * - nextTime: Date-Objekt der nächsten Gebetszeit (für den Countdown)
 */
export function computePrayerStatus(now, todayTimes, tomorrowFirstTime) {
  if (!todayTimes || todayTimes.length === 0) {
    return { activeIndex: null, nextIndex: null, nextTime: null };
  }

  let currentIndex = -1;
  for (let i = 0; i < todayTimes.length; i += 1) {
    if (todayTimes[i]?.time && todayTimes[i].time.getTime() <= now.getTime()) {
      currentIndex = i;
    }
  }

  // Fall 1: Vor dem ersten Gebet des Tages (vor Imsak)
  if (currentIndex === -1) {
    return { 
      activeIndex: null, 
      nextIndex: 0, 
      nextTime: todayTimes[0].time 
    };
  }

  const current = todayTimes[currentIndex];
  const minutesSinceStart = (now.getTime() - current.time.getTime()) / 60000;
  const windowMinutes = ACTIVE_PRAYER_WINDOW_MINUTES || 30;
  const isActive = minutesSinceStart <= windowMinutes;

  // Fall 2: Nach/während dem letzten Gebet des Tages (Yatsi)
  if (currentIndex === todayTimes.length - 1) {
    return {
      activeIndex: isActive ? currentIndex : null,
      nextIndex: 0, // Nächstes Gebet ist Imsak von morgen
      nextTime: tomorrowFirstTime || null,
    };
  }

  // Fall 3: Tagsüber zwischen zwei Gebeten
  return {
    activeIndex: isActive ? currentIndex : null,
    nextIndex: currentIndex + 1,
    nextTime: todayTimes[currentIndex + 1].time,
  };
}

/** Formatiert Sekunden als "HH:MM:SS" für die Countdown-Box. */
export function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Formatiert das Hijri-Datum dynamisch je nach gewählter Sprache (DE, TR, AR) */
export function formatHijriDate(hicriTarihKisa) {
  if (!hicriTarihKisa || typeof hicriTarihKisa !== 'string') return '';
  const parts = hicriTarihKisa.split('.').map((n) => parseInt(n, 10));
  const [day, month, year] = parts;
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return '';

  const lang = HIJRI_MONTHS[APP_LANGUAGE] ? APP_LANGUAGE : 'de';
  const monthList = HIJRI_MONTHS[lang];
  const monthName = monthList[(month - 1 + 12) % 12] ?? '';

  if (lang === 'ar') {
    return `${day} ${monthName} ${year} هـ`;
  }
  if (lang === 'tr') {
    return `${day} ${monthName} ${year} H.`;
  }
  return `${day}. ${monthName} ${year} AH`;
}

/** Abwärtskompatibler Export */
export const formatHijriGerman = formatHijriDate;

/** Formatiert das gregorianische Datum dynamisch je nach gewählter Sprache */
export function formatGregorianDate(date) {
  if (!date) return '';
  const locale = LOCALE_MAP[APP_LANGUAGE] || 'de-DE';

  const day = date.getDate();
  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  const year = date.getFullYear();
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);

  if (APP_LANGUAGE === 'ar') {
    return `${weekday}، ${day} ${month} ${year}`;
  }
  if (APP_LANGUAGE === 'tr') {
    return `${day} ${month} ${year} ${weekday}`;
  }
  return `${day}. ${month} ${year} ${weekday}`;
}

/** Abwärtskompatibler Export */
export const formatGregorianGerman = formatGregorianDate;