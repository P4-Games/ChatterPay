'use client'

import { useRef, useEffect, useCallback, useMemo } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha, useTheme } from '@mui/material/styles'

import Iconify from 'src/components/iconify'
import { useTranslate } from 'src/locales'
import { useGetPolymarketCategories } from 'src/app/api/hooks/use-polymarket'

import PolymarketMarketCard from './polymarket-market-card'
import PolymarketEventCard from './polymarket-event-card'

import type { IPolymarketEvent, IPolymarketCategory } from 'src/types/polymarket'

// ----------------------------------------------------------------------
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'volume', label: 'Volume' },
  { value: 'newest', label: 'Newest' },
  { value: 'ending', label: 'Ending Soon' }
]

type Props = {
  events: IPolymarketEvent[]
  trendingEvents?: IPolymarketEvent[]
  isLoading: boolean
  category: string
  onChangeCategory: (category: string) => void
  sortBy: string
  onChangeSortBy: (sortBy: string) => void
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}

export default function PolymarketMarketList({
  events,
  trendingEvents = [],
  isLoading,
  category,
  onChangeCategory,
  sortBy,
  onChangeSortBy,
  hasMore,
  isLoadingMore,
  onLoadMore
}: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const observerRef = useRef<IntersectionObserver | null>(null)
  const propsRef = useRef({ hasMore, isLoadingMore, isLoading, onLoadMore })
  propsRef.current = { hasMore, isLoadingMore, isLoading, onLoadMore }

  const { data: categoriesData } = useGetPolymarketCategories()
  const allCategories: IPolymarketCategory[] = categoriesData?.data ?? []
  const topCategories = allCategories.filter((c) => !c.parentCategory)

  const sortedEvents = useMemo(() => {
    if (!events) return [];

    // For 'recommended' or any other unknown sort, return events in their original order
    if (sortBy === 'recommended' || !['volume', 'ending'].includes(sortBy)) {
      return events;
    }

    return [...events].sort((a, b) => {
      const volA = a.markets.reduce((sum, m) => sum + (m.volume || 0), 0);
      const volB = b.markets.reduce((sum, m) => sum + (m.volume || 0), 0);

      if (sortBy === 'volume') {
        return volB - volA;
      }

      if (sortBy === 'ending') {
        const endA = a.markets
          .filter((m) => m.end_date_iso)
          .map((m) => new Date(m.end_date_iso).getTime())
          .sort((x, y) => x - y)[0] || Number.MAX_SAFE_INTEGER;
        const endB = b.markets
          .filter((m) => m.end_date_iso)
          .map((m) => new Date(m.end_date_iso).getTime())
          .sort((x, y) => x - y)[0] || Number.MAX_SAFE_INTEGER;
        return endA - endB;
      }

      return 0;
    });
  }, [events, sortBy]);

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
        const { hasMore: hm, isLoadingMore: ilm, isLoading: il, onLoadMore: olm } = propsRef.current
        if (entries[0].isIntersecting && hm && !ilm && !il) {
          olm()
        }
      },
      { threshold: 0, rootMargin: '0px 0px 200px 0px' }
    )
    observerRef.current.observe(node)
  }, [])

  // Disconnect observer on unmount
  useEffect(() => () => { observerRef.current?.disconnect() }, [])

  const renderFilters = (
    <Stack
      direction='row'
      alignItems='center'
      justifyContent='space-between'
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          gap: '2px',
          bgcolor: isDark ? alpha(theme.palette.grey[500], 0.12) : '#ebebeb',
          borderRadius: 50,
          p: 0.5,
          maxWidth: '100%',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {['All', ...topCategories.map((c) => c.label)].map((label) => {
          const isActive = category === label
          return (
            <Chip
              key={label}
              label={label}
              onClick={() => onChangeCategory(label)}
              sx={{
                borderRadius: 50,
                px: 0.5,
                height: 32,
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.85rem',
                fontFamily: "'Satoshi Variable', sans-serif",
                bgcolor: isActive ? 'background.paper' : 'transparent',
                boxShadow: isActive ? (theme.customShadows?.z1 || '0px 6px 17px 0px rgba(0,0,0,0.08)') : 'none',
                color: 'text.primary',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: isActive ? 'background.paper' : alpha(theme.palette.grey[500], 0.08),
                },
              }}
            />
          )
        })}
      </Box>

      <Select
        size='small'
        value={sortBy}
        onChange={(e) => onChangeSortBy(e.target.value)}
        startAdornment={
          <InputAdornment position='start'>
            <Iconify icon='solar:sort-vertical-bold' width={18} sx={{ color: 'text.secondary', ml: 0.5 }} />
          </InputAdornment>
        }
        sx={{
          minWidth: 150,
          flexShrink: 0,
          borderRadius: 50,
          bgcolor: isDark ? alpha(theme.palette.grey[500], 0.12) : '#ebebeb',
          '& .MuiSelect-select': {
            py: 1,
            pl: '0 !important',
            fontSize: '0.85rem',
            fontWeight: 600,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        }}
      >
        {SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  )

  const renderLoading = (
    <Grid container spacing={3}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Grid xs={12} sm={6} md={4} lg={3} key={index}>
          <Skeleton
            variant='rounded'
            sx={{ height: 340, borderRadius: 2 }}
          />
        </Grid>
      ))}
    </Grid>
  )

  const renderEmpty = (
    <Stack alignItems='center' justifyContent='center' sx={{ py: 10 }}>
      <Typography variant='h6' color='text.secondary'>
        {t('polymarket.no-markets')}
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
      {renderFilters}
      {isLoading && renderLoading}
      {!isLoading && sortedEvents.length === 0 && renderEmpty}
      {!isLoading && sortedEvents.length > 0 && renderList}

      {/* Infinite scroll sentinel */}
      {!isLoading && hasMore && (
        <Stack ref={sentinelRef} alignItems='center' sx={{ py: 4 }}>
          {isLoadingMore && <CircularProgress size={32} color='primary' />}
        </Stack>
      )}
    </Box>
  )
}
