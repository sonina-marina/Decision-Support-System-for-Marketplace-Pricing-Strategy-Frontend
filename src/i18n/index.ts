import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ru from './locales/ru.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru'],
    interpolation: {
      escapeValue: false, // React уже экранирует значения
    },
    detection: {
      // Порядок определения языка: сохранённый выбор -> язык браузера -> англ.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'pricelens-lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
