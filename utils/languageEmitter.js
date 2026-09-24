import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LANGUAGE_STORAGE_KEY = 'gebetsapp:selectedLanguage';
export const LANGUAGE_EVENT_NAME = 'onLanguageChanged';

/**
 * Sendet das Signal zur Sprachänderung an die Hauptanwendung
 * und speichert die Wahl dauerhaft im AsyncStorage.
 */
export const emitLanguageChange = async (newLang) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    DeviceEventEmitter.emit(LANGUAGE_EVENT_NAME, newLang);
  } catch (err) {
    console.warn('Fehler beim Senden der Sprachänderung:', err);
  }
};