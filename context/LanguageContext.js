import { createContext, useState, useContext, useEffect } from 'react';
import { I18nManager } from 'react-native';
import { TRANSLATIONS } from '../utils/translations';
import { APP_LANGUAGE } from '../constants/config';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(APP_LANGUAGE || 'de');

  const changeLanguage = (newLang) => {
    setLanguage(newLang);

    // Visuelle Ausrichtung (RTL für Arabisch) auf Physik-Ebene anpassen
    const isRtlLang = newLang === 'ar';
    if (I18nManager.isRTL !== isRtlLang) {
      I18nManager.allowRTL(isRtlLang);
      I18nManager.forceRTL(isRtlLang);
    }
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.de;
  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);