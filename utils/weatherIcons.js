/**
 * weatherIcons.js
 * ---------------------------------------------------------------------------
 * Bildet die "weather_code" Werte (WMO-Standard) der Open-Meteo API auf ein
 * einfaches Emoji-Icon ab. Emojis reichen für einen Info-Bildschirm völlig
 * aus und benötigen keine zusätzlichen Bild-Assets oder Icon-Libraries.
 * Tag/Nacht wird anhand der lokalen Stunde unterschieden (z.B. Mond statt
 * Sonne am Abend, siehe Anhang-Bild 1).
 * ---------------------------------------------------------------------------
 */
export function getWeatherIcon(weatherCode, date = new Date()) {
  const hour = date.getHours();
  const isNight = hour < 6 || hour >= 20;

  if (weatherCode === null || weatherCode === undefined) return '🌡️';

  // Klarer Himmel
  if (weatherCode === 0) return isNight ? '🌙' : '☀️';
  // Überwiegend klar / leicht bewölkt
  if ([1, 2].includes(weatherCode)) return isNight ? '🌤️' : '🌤️';
  // Bedeckt
  if (weatherCode === 3) return '☁️';
  // Nebel
  if ([45, 48].includes(weatherCode)) return '🌫️';
  // Nieselregen
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return '🌦️';
  // Regen
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return '🌧️';
  // Schnee
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return '❄️';
  // Gewitter
  if ([95, 96, 99].includes(weatherCode)) return '⛈️';

  return '🌡️';
}
