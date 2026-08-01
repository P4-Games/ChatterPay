'use client'

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useSettingsContext } from 'src/components/settings'

import i18nInstance from './i18n'
import { allLangs, defaultLang } from './config-lang'
import { languageCookieKey } from './detect-language'

// ----------------------------------------------------------------------

export function useLocales() {
  const currentLang = allLangs.find((lang) => lang.value === i18nInstance.language) || defaultLang

  return {
    allLangs,
    currentLang
  }
}

// ----------------------------------------------------------------------

export function useTranslate() {
  const { t, i18n, ready } = useTranslation()

  const settings = useSettingsContext()

  const onChangeLang = useCallback(
    (newlang: string) => {
      i18n.changeLanguage(newlang)
      // Persist only manual selections: without the cookie, the server
      // re-detects from Accept-Language on every visit (see detect-language).
      // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API lacks Firefox/Safari support
      document.cookie = `${languageCookieKey}=${newlang}; path=/; max-age=31536000; SameSite=Lax`
      settings.onChangeDirectionByLang(newlang)
    },
    [i18n, settings]
  )

  return {
    t,
    i18n,
    ready,
    onChangeLang
  }
}
