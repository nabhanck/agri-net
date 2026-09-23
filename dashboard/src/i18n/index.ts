import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import hiTranslation from './locales/hi/translation.json';
import mlTranslation from './locales/ml/translation.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  hi: {
    translation: hiTranslation,
  },
  ml: {
    translation: mlTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'ml'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'agrinet_language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
