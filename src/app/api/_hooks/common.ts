import useSWR from 'swr'
import { useMemo } from 'react'

import { fetcher } from 'src/app/api/_hooks/api-resolver'

// ----------------------------------------------------------------------

export function useGetCommon(endpoint: any, options: {} = {}, shouldRefresh: boolean = false) {
  const { data, error, isLoading, isValidating } = useSWR(endpoint, fetcher)

  const memoizedValue = useMemo(
    () => ({
      data,
      isLoading,
      error,
      isValidating,
      empty: !isLoading && !data?.length
    }),
    [data, error, isLoading, isValidating]
  )

  return memoizedValue
}
