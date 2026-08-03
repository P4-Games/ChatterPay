'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { defaultLang } from './config-lang'
import translationEn from './langs/en.json'
import translationBR from './langs/br.json'
import translationES from './langs/es.json'
import { supportedLanguages } from './detect-language'

// ----------------------------------------------------------------------

i18n.use(initReactI18next).init({
  resources: {
    en: { translations: translationEn },
    br: { translations: translationBR },
    es: { translations: translationES }
  },
  // Placeholder until LocalizationProvider applies the language resolved by
  // the server (cookie or Accept-Language) before the first render.
  lng: defaultLang.value,
  fallbackLng: 'en',
  supportedLngs: supportedLanguages,
  debug: false,
  ns: ['translations'],
  defaultNS: 'translations',
  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: true
  }
})

export default i18n
