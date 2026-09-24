import { 
  findEntryForDate, 
  buildPrayerTimesForDay, 
  computePrayerStatus, 
  formatCountdown 
} from '../utils/prayerTimeUtils';

// Simulated API multi-month response
const mockApiResponse = [
  { 
    MiladiTarihKisa: '20.09.2026', 
    Imsak: '05:00', 
    Gunes: '06:30', 
    Ogle: '13:15', 
    Ikindi: '16:45', 
    Aksam: '19:30', 
    Yatsi: '21:00' 
  },
  { 
    MiladiTarihKisa: '21.09.2026', 
    Imsak: '05:02', 
    Gunes: '06:32', 
    Ogle: '13:14', 
    Ikindi: '16:44', 
    Aksam: '19:28', 
    Yatsi: '20:58' 
  }
];

describe('Prayer Time Utility Tests', () => {
  const today = new Date(2026, 8, 20); // 20. September 2026
  const tomorrow = new Date(2026, 8, 21); // 21. September 2026

  const todayEntry = findEntryForDate(mockApiResponse, today);
  const tomorrowEntry = findEntryForDate(mockApiResponse, tomorrow);

  const todayTimes = buildPrayerTimesForDay(todayEntry, today);
  const tomorrowTimes = buildPrayerTimesForDay(tomorrowEntry, tomorrow);

  test('1. Findet den richtigen Eintrag in der Mehrmonatsliste', () => {
    expect(todayEntry).not.toBeNull();
    expect(todayEntry.MiladiTarihKisa).toBe('20.09.2026');
  });

  test('2. Vor dem ersten Gebet (04:00 Uhr) -> Nächstes Gebet ist Imsak', () => {
    const now = new Date(2026, 8, 20, 4, 0, 0);
    const status = computePrayerStatus(now, todayTimes, tomorrowTimes[0]?.time);

    expect(status.activeIndex).toBeNull();
    expect(status.nextIndex).toBe(0);
    expect(status.nextTime).toEqual(todayTimes[0].time);
  });

  test('3. Während des 30-Minuten-Fensters von Mittag (13:20 Uhr) -> Countdown läuft weiter auf Ikindi', () => {
    const now = new Date(2026, 8, 20, 13, 20, 0); // 5 Min nach Ogle
    const status = computePrayerStatus(now, todayTimes, tomorrowTimes[0]?.time);

    expect(status.activeIndex).toBe(2); // Ogle ist aktiv
    expect(status.nextIndex).toBe(3);   // Ikindi ist das nächste Gebet
    expect(status.nextTime).toEqual(todayTimes[3].time); // Darf NICHT null sein!
  });

  test('4. Nach 30 Minuten (14:00 Uhr) -> Kein aktives Gebet, nächstes ist weiterhin Ikindi', () => {
    const now = new Date(2026, 8, 20, 14, 0, 0);
    const status = computePrayerStatus(now, todayTimes, tomorrowTimes[0]?.time);

    expect(status.activeIndex).toBeNull();
    expect(status.nextIndex).toBe(3);
    expect(status.nextTime).toEqual(todayTimes[3].time);
  });

  test('5. Nach Nachtgebet (22:00 Uhr) -> Nächstes Gebet ist morgiges Imsak', () => {
    const now = new Date(2026, 8, 20, 22, 0, 0);
    const status = computePrayerStatus(now, todayTimes, tomorrowTimes[0]?.time);

    expect(status.nextIndex).toBe(0);
    expect(status.nextTime).toEqual(tomorrowTimes[0].time);
  });

  test('6. Countdown-Formatierung liefert korrekten HH:MM:SS String', () => {
    expect(formatCountdown(3665)).toBe('01:01:05');
    expect(formatCountdown(0)).toBe('00:00:00');
    expect(formatCountdown(-10)).toBe('00:00:00');
  });

  test('7. Toleranz bei fehlenden Daten / Netzwerkfehler', () => {
    const emptyEntry = findEntryForDate([], today);
    expect(emptyEntry).toBeNull();

    const emptyTimes = buildPrayerTimesForDay(null, today);
    expect(emptyTimes).toEqual([]);
  });

  test('8. Exakter Umschaltmoment zur Gebetszeit (z. B. Punkt 13:15:00 Uhr)', () => {
    const exactOgleTime = new Date(2026, 8, 20, 13, 15, 0);
    const status = computePrayerStatus(exactOgleTime, todayTimes, tomorrowTimes[0]?.time);

    expect(status.activeIndex).toBe(2); // Ogle wird exakt in der Sekunde aktiv
    expect(status.nextIndex).toBe(3);   // Ikindi ist nächstes Ziel
  });

  test('9. Monatswechsel (31. Oktober auf 01. November)', () => {
    const endOfMonthResponse = [
      { MiladiTarihKisa: '31.10.2026', Imsak: '05:30', Gunes: '07:00', Ogle: '13:00', Ikindi: '15:45', Aksam: '18:10', Yatsi: '19:35' },
      { MiladiTarihKisa: '01.11.2026', Imsak: '05:31', Gunes: '07:02', Ogle: '13:00', Ikindi: '15:43', Aksam: '18:08', Yatsi: '19:33' }
    ];
    
    const Oct31 = new Date(2026, 9, 31);
    const Nov01 = new Date(2026, 10, 1);

    expect(findEntryForDate(endOfMonthResponse, Oct31)?.MiladiTarihKisa).toBe('31.10.2026');
    expect(findEntryForDate(endOfMonthResponse, Nov01)?.MiladiTarihKisa).toBe('01.11.2026');
  });
});