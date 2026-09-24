import { BERLIN_LATITUDE, BERLIN_LONGITUDE } from '../constants/config';

/**
 * api.js
 * ---------------------------------------------------------------------------
 * Sämtliche Netzwerk-Aufrufe der App an einer Stelle gebündelt, damit die
 * Komponenten selbst schlank und rein präsentierend bleiben.
 * ---------------------------------------------------------------------------
 */

/**
 * Holt die aktuelle Temperatur & den Wettercode für Berlin (Open-Meteo).
 * Doku: https://open-meteo.com/en/docs
 */
export async function fetchWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${BERLIN_LATITUDE}&longitude=${BERLIN_LONGITUDE}&current=temperature_2m,weather_code`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wetter-API Fehler: ${response.status}`);
  }
  const data = await response.json();
  const current = data?.current ?? {};
  return {
    temperature: typeof current.temperature_2m === 'number' ? Math.round(current.temperature_2m) : null,
    weatherCode: typeof current.weather_code === 'number' ? current.weather_code : null,
  };
}

/**
 * Holt die Gebetszeiten für die in config.js hinterlegten Koordinaten (AlAdhan API mit Diyanet-Berechnung).
 * Die API liefert das ganze Jahr an Tagesdatensätzen zurück und transformiert sie in die
 * gewohnte Diyanet-Datenstruktur.
 *
 * Erwartete Felder pro Tagesdatensatz:
 *   MiladiTarihKisa   -> "27.08.2026"           (gregorianisches Datum)
 *   HicriTarihKisa    -> "14.1.1448"            (hijri Datum, T.M.JJJJ)
 *   Imsak / Gunes / Ogle / Ikindi / Aksam / Yatsi -> "HH:MM" Uhrzeiten
 */
function applyOffset(timeStr, offsetMinutes) {
  if (!timeStr || !offsetMinutes) return timeStr;

  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  let minutes = parseInt(parts[1], 10);

  // Erstelle ein Date-Objekt zur sicheren Minuten-Berechnung (behandelt auch Überläufe über Mitternacht)
  const date = new Date();
  date.setHours(hours, minutes + offsetMinutes, 0, 0);

  const newHours = String(date.getHours()).padStart(2, '0');
  const newMinutes = String(date.getMinutes()).padStart(2, '0');

  return `${newHours}:${newMinutes}`;
}

export async function fetchPrayerTimes(
  latitude = BERLIN_LATITUDE,
  longitude = BERLIN_LONGITUDE,
  year = new Date().getFullYear(),
  offsets = {
    Imsak: +10,
    Gunes: 0,
    Ogle: 0,
    Ikindi: 0,
    Aksam: 1,
    Yatsi: -3,
  }
) {
  // Method 13 = Diyanet İşleri Başkanlığı
  const method = 13;
  // latitudeAdjustmentMethod = 3 (Angle Based - Diyanet-Standard für hohe Breitengrade)
  const latitudeAdjustmentMethod = 3;
  const url = `https://api.aladhan.com/v1/calendar/${year}?latitude=${latitude}&longitude=${longitude}&method=${method}&latitudeAdjustmentMethod=${latitudeAdjustmentMethod}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Gebetszeiten-API Fehler: ${response.status}`);
  }

  const json = await response.json();
  const rawData = json?.data ?? {};

  // Die API liefert ein Objekt mit Monats-Arrays ("1", "2", ..., "12")
  const allDays = Object.values(rawData).flat();

  // Mapping in die erwartete Diyanet-Datenstruktur
  return allDays.map((dayData) => {
    const timings = dayData.timings;
    const gDate = dayData.date.gregorian;
    const hDate = dayData.date.hijri;

    // Entfernt eventuelle Zeitzonen-Anhänge wie "(CET)"
    const cleanTime = (timeStr) => (timeStr ? timeStr.split(' ')[0] : '');

    const formattedDay = String(gDate.day).padStart(2, '0');
    const formattedMonth = String(gDate.month.number).padStart(2, '0');

    // Zeiten bereinigen und Offsets anwenden
    const imsakTime = applyOffset(cleanTime(timings.Imsak), offsets.Imsak ?? 0);
    const gunesTime = applyOffset(cleanTime(timings.Sunrise), offsets.Gunes ?? 0);
    const ogleTime = applyOffset(cleanTime(timings.Dhuhr), offsets.Ogle ?? 0);
    const ikindiTime = applyOffset(cleanTime(timings.Asr), offsets.Ikindi ?? 0);
    const aksamTime = applyOffset(cleanTime(timings.Maghrib), offsets.Aksam ?? 0);
    const yatsiTime = applyOffset(cleanTime(timings.Isha), offsets.Yatsi ?? 0);

    return {
      HicriTarihKisa: `${hDate.day}.${hDate.month.number}.${hDate.year}`,
      HicriTarihKisaIso8601: null,
      HicriTarihUzun: `${hDate.day} ${hDate.month.tr || hDate.month.en} ${hDate.year}`,
      HicriTarihUzunIso8601: null,
      AyinSekliURL: 'https://namazvakti.diyanet.gov.tr/images/sd2.gif',
      MiladiTarihKisa: `${formattedDay}.${formattedMonth}.${gDate.year}`,
      MiladiTarihKisaIso8601: `${formattedDay}.${formattedMonth}.${gDate.year}`,
      MiladiTarihUzun: `${gDate.day} ${gDate.month.en} ${gDate.year} ${gDate.weekday.en}`,
      MiladiTarihUzunIso8601: `${gDate.year}-${formattedMonth}-${formattedDay}T00:00:00.0000000+03:00`,
      GreenwichOrtalamaZamani: 3,
      Aksam: aksamTime,
      Gunes: gunesTime,
      GunesBatis: aksamTime,
      GunesDogus: gunesTime,
      Ikindi: ikindiTime,
      Imsak: imsakTime,
      KibleSaati: ogleTime,
      Ogle: ogleTime,
      Yatsi: yatsiTime,
    };
  });
}