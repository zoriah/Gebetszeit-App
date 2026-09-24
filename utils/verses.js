/**
 * verses.js
 * ---------------------------------------------------------------------------
 * Holt den Vers des Tages live von der öffentlichen AlQuran-Cloud-API.
 * Unterstützt die Sprachen: 'de' (Deutsch), 'tr' (Türkisch), 'ar' (Arabisch).
 * ---------------------------------------------------------------------------
 */

const EDITIONS = {
  de: 'de.bubenheim',
  tr: 'tr.diyanet',
  ar: 'quran-simple',
};

const FALLBACKS = {
  de: {
    text: 'Und sucht Hilfe in Geduld und Gebet.',
    reference: 'Al-Baqara (Vers 45)',
  },
  tr: {
    text: 'Sabır ve namazla Allah’tan yardım isteyin.',
    reference: 'Bakara (Ayet 45)',
  },
  ar: {
    text: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ',
    reference: 'البقرة (آية ٤٥)',
  },
};

/**
 * Kürzt einen gegebenen Text auf maximal 2 Sätze.
 * @param {string} text 
 * @returns {string}
 */
export function limitToTwoSentences(text) {
  if (!text) return '';
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  if (!sentences || sentences.length <= 2) {
    return text.trim();
  }
  return sentences.slice(0, 2).join(' ').trim();
}

/**
 * Lädt einen zufälligen Vers live von der API in der gewünschten Sprache.
 * @param {'de' | 'tr' | 'ar'} lang - Die gewünschte Sprache (Standard: 'de')
 * @returns {Promise<{text: string, reference: string}>}
 */
export async function pickVerseForDate(lang = 'de') {
  const edition = EDITIONS[lang] || EDITIONS.de;

  try {
    const response = await fetch(`https://api.alquran.cloud/v1/ayah/random/${edition}`);
    const json = await response.json();

    if (json.code === 200 && json.data) {
      const surahName = lang === 'tr' && json.data.surah.englishName
        ? json.data.surah.englishName
        : (lang === 'ar' ? json.data.surah.name : json.data.surah.englishName);

      const label = lang === 'tr' ? 'Ayet' : (lang === 'ar' ? 'آية' : 'Vers');

      return {
        text: limitToTwoSentences(json.data.text),
        reference: `${surahName} (${label} ${json.data.numberInSurah})`,
      };
    }

    throw new Error('API-Antwort ungültig');
  } catch (error) {
    console.warn(`Fehler beim Laden des Verses (${lang}), nutze Fallback:`, error);
    const fallback = FALLBACKS[lang] || FALLBACKS.de;
    return {
      text: limitToTwoSentences(fallback.text),
      reference: fallback.reference,
    };
  }
}