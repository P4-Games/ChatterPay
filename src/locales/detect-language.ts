// Pure helpers shared by server (root layout) and client (i18n) code
// must stay free of 'use client' and browser/node-only APIs.

// ----------------------------------------------------------------------

export const languageCookieKey = 'i18nextLng'

export const supportedLanguages = ['en', 'es', 'br']

/**
 * Maps a locale (e.g. "es-AR", "pt-BR", "en-US") to one of the app's
 * supported languages. Spanish speakers get "es", Portuguese speakers
 * get "br", everyone else "en".
 */
export const mapLocaleToSupportedLanguage = (locale: string): string => {
  if (supportedLanguages.includes(locale)) {
    return locale
  }

  const languagePrefix = locale.toLowerCase().split('-')[0]

  if (languagePrefix === 'es') return 'es'
  if (languagePrefix === 'pt') return 'br'

  return 'en'
}

/**
 * Resolves the language to serve: a manually saved selection (cookie) wins,
 * otherwise the browser's preferred locale from the Accept-Language header.
 * Runs on the server so SSR HTML already matches what the client renders.
 */
export function resolveInitialLanguage(
  savedLanguage: string | null | undefined,
  acceptLanguageHeader: string | null | undefined
): string {
  if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
    return savedLanguage
  }

  const preferredLocale = acceptLanguageHeader?.split(',')[0]?.split(';')[0]?.trim()

  if (preferredLocale) {
    return mapLocaleToSupportedLanguage(preferredLocale)
  }

  return 'en'
}
