import useSWR from 'swr'
import { useMemo } from 'react'

import { fetcher, endpoints } from 'src/app/api/hooks/api-resolver'

import type { INewsItem } from 'src/types/news'

// ----------------------------------------------------------------------

// Announcements change on the scale of days, and the route already answers from Mongo on every
// request, so a revalidation per hour is enough to pick up an operator's edit on a long session.
const REFRESH_INTERVAL = 60 * 60 * 1000

// ----------------------------------------------------------------------

/**
 * Hook for fetching the announcements active right now, in the given language.
 *
 * @param lang - UI language code
 * @returns The active announcements and the loading state
 */
export function useGetActiveNews(lang: string) {
  const { data, error, isLoading } = useSWR(endpoints.news(lang), fetcher, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: false,
    shouldRetryOnError: false
  })

  const news = useMemo<INewsItem[]>(() => data?.data?.news ?? [], [data])

  return useMemo(() => ({ news, isLoading, error }), [news, isLoading, error])
}
