'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

// ----------------------------------------------------------------------

/**
 * Keeps a server-rendered page in sync with a client-side language switch.
 *
 * Pages whose copy is picked on the server from the language cookie (the legal
 * documents) never hear about the popover changing it, so their text stayed in
 * the previous language until a manual reload. The effect runs after the
 * popover has written the cookie, and refresh() re-renders the server tree
 * with the new language without a full page reload.
 *
 * Only for pages that read the cookie server-side: anything rendered through
 * t() already re-renders on its own.
 */
export function useRefreshOnLanguageChange() {
  const { i18n } = useTranslation()
  const router = useRouter()

  // The provider applies the server-resolved language before children mount,
  // so this starts out matching and no refresh fires on the first render.
  const previousLanguage = useRef(i18n.language)

  useEffect(() => {
    if (previousLanguage.current === i18n.language) return

    previousLanguage.current = i18n.language
    router.refresh()
  }, [i18n.language, router])
}
