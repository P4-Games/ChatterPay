import useSWR from 'swr'
import { useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'

import { fetcher } from 'src/app/api/hooks/api-resolver'

// ----------------------------------------------------------------------

export function useGetCommon(
  endpoint: any,
  options: {} = {},
  refreshInterval: number | ((latestData: any) => number) = 0
) {
  const { data, error, isLoading, isValidating, mutate } = useSWR([endpoint, options], fetcher, {
    refreshInterval
  })

  const memoizedValue = useMemo(
    () => ({
      data,
      isLoading,
      error,
      isValidating,
      mutate,
      empty: !isLoading && !data?.length
    }),
    [data, error, isLoading, isValidating, mutate]
  )

  return memoizedValue
}

export function useGetCommonPaged(
  getKey: (pageIndex: number, previousPageData: any) => string | null,
  options: {} = {}
) {
  const { data, error, size, setSize, isLoading, isValidating } = useSWRInfinite(
    getKey,
    fetcher,
    options
  )

  const memoizedValue = useMemo(
    () => ({
      data,
      isLoading,
      error,
      isValidating,
      size,
      setSize,
      empty: !isLoading && !data?.length,
      isReachingEnd: !!(data && size >= data[0].totalPages!)
    }),
    [data, error, isLoading, isValidating, setSize, size]
  )

  return memoizedValue
}
