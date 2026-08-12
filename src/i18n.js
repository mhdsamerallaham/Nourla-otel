import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import tr from './locales/tr.json';
import en from './locales/en.json';
import de from './locales/de.json';
import ru from './locales/ru.json';

const resources = {
  tr: { translation: tr },
  en: { translation: en },
  de: { translation: de },
  ru: { translation: ru },
};

// Extract initial language from URL path if available
const pathLang = window.location.pathname.split('/')[1];
const initialLang = ['tr', 'en', 'de', 'ru'].includes(pathLang) ? pathLang : 'tr';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
