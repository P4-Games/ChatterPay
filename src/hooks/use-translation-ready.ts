'use client'

import { useState, useEffect } from 'react'

import i18n from 'src/locales/i18n'

// ----------------------------------------------------------------------

/**
 * Custom hook to delay rendering until i18n is fully initialized.
 * Helps avoid hydration issues by ensuring translations are ready before rendering.
 *
 * Note: This hook listens to the i18n 'initialized' event and updates state accordingly.
 */
export function useTranslationReady() {
  const [ready, setReady] = useState(i18n.isInitialized)

  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.on('initialized', () => setReady(true))
    }
  }, [])

  return ready
}
