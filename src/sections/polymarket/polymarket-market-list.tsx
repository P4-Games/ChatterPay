'use client'

import { useRef, useEffect, useCallback, useMemo } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import CircularProgress from '@mui/material/CircularProgress'

import { useTranslate } from 'src/locales'

import PolymarketMarketToolbar from './polymarket-market-toolbar'
import PolymarketMarketCard from './polymarket-market-card'
import PolymarketEventCard from './polymarket-event-card'

import type { IPolymarketEvent } from 'src/types/polymarket'

// ----------------------------------------------------------------------

/** Infinite-scroll state, grouped so it can be disabled as one unit (pass `null`). */
export type PolymarketPagination = {
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}

type Props = {
  events: IPolymarketEvent[]
  isLoading: boolean
  category: string
  onChangeCategory: (category: string) => void
  sortBy: string
  onChangeSortBy: (sortBy: string) => void
  searchQuery: string
  onChangeSearchQuery: (query: string) => void
  isSearching: boolean
  /** `null` disables infinite scroll (e.g. while showing search results). */
  pagination: PolymarketPagination | null
}

/**
 * Filterable, sortable market grid with infinite scroll.
 * @param {Props} props - Events, loading state, filter handlers and pagination.
 * @returns {JSX.Element} The market list section.
 */
export default function PolymarketMarketList({
  events,
  isLoading,
  category,
  onChangeCategory,
  sortBy,
  onChangeSortBy,
  searchQuery,
  onChangeSearchQuery,
  isSearching,
  pagination
}: Props) {
  const { t } = useTranslate()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const propsRef = useRef({ pagination, isLoading })

  useEffect(() => {
    propsRef.current = { pagination, isLoading }
  }, [pagination, isLoading])

  const sortedEvents = useMemo(() => {
    if (!events) return []

    // For 'recommended' or any other unknown sort, return events in their original order
    if (sortBy === 'recommended' || !['volume', 'ending'].includes(sortBy)) {
      return events
    }

    return [...events].sort((a, b) => {
      const volA = a.markets.reduce((sum, m) => sum + (m.volume || 0), 0)
      const volB = b.markets.reduce((sum, m) => sum + (m.volume || 0), 0)

      if (sortBy === 'volume') {
        return volB - volA
      }

      if (sortBy === 'ending') {
        const endA =
          a.markets
            .filter((m) => m.end_date_iso)
            .map((m) => new Date(m.end_date_iso).getTime())
            .sort((x, y) => x - y)[0] || Number.MAX_SAFE_INTEGER
        const endB =
          b.markets
            .filter((m) => m.end_date_iso)
            .map((m) => new Date(m.end_date_iso).getTime())
            .sort((x, y) => x - y)[0] || Number.MAX_SAFE_INTEGER
        return endA - endB
      }

      return 0
    })
  }, [events, sortBy])

  // Stable sentinel callback ref — observer is created once and reads current
  // props via ref so it never needs to be torn down/recreated on prop changes.
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (!node) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const { pagination: p, isLoading: il } = propsRef.current
        if (entries[0].isIntersecting && p && p.hasMore && !p.isLoadingMore && !il) {
          p.onLoadMore()
        }
      },
      { threshold: 0, rootMargin: '0px 0px 200px 0px' }
    )
    observerRef.current.observe(node)
  }, [])

  // Disconnect observer on unmount
  useEffect(
    () => () => {
      observerRef.current?.disconnect()
    },
    []
  )

  const renderLoading = (
    <Grid container spacing={3}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Grid xs={12} sm={6} md={4} lg={3} key={index}>
          <Skeleton variant='rounded' sx={{ height: 340, borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
  )

  const renderEmpty = (
    <Stack alignItems='center' justifyContent='center' sx={{ py: 10 }}>
      <Typography variant='h6' color='text.secondary'>
        {isSearching
          ? t('polymarket.no-search-results', { query: searchQuery.trim() })
          : t('polymarket.no-markets')}
      </Typography>
    </Stack>
  )

  const renderList = (
    <Grid container spacing={2}>
      {sortedEvents.map((event) => {
        const isSingleMarket = event.markets.length === 1
        const key = event.id || event.slug

        return (
          <Grid xs={12} sm={6} md={4} lg={3} key={key} sx={{ display: 'flex' }}>
            {isSingleMarket ? (
              <PolymarketMarketCard market={event.markets[0]} inlineImage />
            ) : (
              <PolymarketEventCard event={event} />
            )}
          </Grid>
        )
      })}
    </Grid>
  )

  return (
    <Box>
      <PolymarketMarketToolbar
        category={category}
        onChangeCategory={onChangeCategory}
        sortBy={sortBy}
        onChangeSortBy={onChangeSortBy}
        searchQuery={searchQuery}
        onChangeSearchQuery={onChangeSearchQuery}
        disabled={isSearching}
      />

      {isLoading && renderLoading}
      {!isLoading && sortedEvents.length === 0 && renderEmpty}
      {!isLoading && sortedEvents.length > 0 && renderList}

      {/* Infinite scroll sentinel */}
      {!isLoading && pagination?.hasMore && (
        <Stack ref={sentinelRef} alignItems='center' sx={{ py: 4 }}>
          {pagination.isLoadingMore && <CircularProgress size={32} color='primary' />}
        </Stack>
      )}
    </Box>
  )
}
