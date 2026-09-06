import axios from 'axios'

import { UI_BASE_URL, BACKEND_API_URL, BACKEND_API_TOKEN } from 'src/config-global'

import type { INewsItem, NewsTarget } from 'src/types/news'

// ----------------------------------------------------------------------

type BackendResponse<TData extends object> = {
  status: 'success' | 'error'
  data: TData
  timestamp: string
}

// ----------------------------------------------------------------------

/**
 * Maps the language code the UI uses onto the one the backend templates carry.
 *
 * The locale list uses `br` for Portuguese while the templates use `pt`, so without this every
 * Brazilian visitor would silently fall back to English.
 *
 * @param lang UI language code
 */
export function toBackendLang(lang: string | null | undefined): 'en' | 'es' | 'pt' {
  const normalized = (lang ?? '').trim().toLowerCase()
  if (normalized.startsWith('es')) return 'es'
  if (normalized.startsWith('br') || normalized.startsWith('pt')) return 'pt'
  return 'en'
}

/**
 * Fetches the announcements the backend considers active right now for one surface.
 *
 * @param lang UI language code, mapped to the backend one before the call
 * @param target Surface being rendered, so the backend leaves out what belongs to the other one
 */
export async function getActiveNews(lang: string, target: NewsTarget): Promise<INewsItem[]> {
  const response = await axios.get<BackendResponse<{ news?: INewsItem[] }>>(
    `${BACKEND_API_URL}/news?lang=${toBackendLang(lang)}&target=${encodeURIComponent(target)}`,
    {
      headers: {
        Origin: UI_BASE_URL,
        Authorization: `Bearer ${BACKEND_API_TOKEN}`
      }
    }
  )

  if (response.data.status !== 'success') return []

  return response.data.data?.news ?? []
}
