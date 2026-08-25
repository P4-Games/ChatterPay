'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider as MuiLocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

import i18n from './i18n'
import { useLocales } from './use-locales'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
  initialLanguage: string
}

export default function LocalizationProvider({ children, initialLanguage }: Props) {
  // Subscribes to languageChanged so adapterLocale updates on manual switches.
  useTranslation()

  // Applies the server-resolved language before the first render — on the
  // server (per request) and on the client (before hydration) — so SSR HTML
  // and client markup always agree. useState initializer = runs once per mount.
  useState(() => {
    if (i18n.language !== initialLanguage) {
      i18n.changeLanguage(initialLanguage)
    }
    return initialLanguage
  })

  const { currentLang } = useLocales()

  return (
    <MuiLocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={currentLang.adapterLocale}>
      {children}
    </MuiLocalizationProvider>
  )
}
