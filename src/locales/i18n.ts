'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import { getStorageItem } from 'src/hooks/use-local-storage'

import { defaultLang } from './config-lang'
import translationEn from './langs/en.json'
import translationBR from './langs/br.json'
import translationES from './langs/es.json'

// ----------------------------------------------------------------------

const lng = getStorageItem('i18nextLng', defaultLang.value)

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translations: translationEn },
      br: { translations: translationBR },
      es: { translations: translationES }
    },
    lng,
    fallbackLng: 'es',
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
