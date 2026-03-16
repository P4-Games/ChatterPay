'use client'

import { useRef, useEffect } from 'react'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Stack from '@mui/material/Stack'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { useGetPolymarketCategories } from 'src/app/api/hooks/use-polymarket'

import PolymarketMarketCard from './polymarket-market-card'
import PolymarketEventCard from './polymarket-event-card'

import type { IPolymarketEvent, IPolymarketCategory } from 'src/types/polymarket'

// ----------------------------------------------------------------------
const SORT_OPTIONS = [
  { value: 'volume', label: 'Volume' },
  { value: 'newest', label: 'Newest' },
  { value: 'ending', label: 'Ending Soon' }
]

type Props = {
  events: IPolymarketEvent[]
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
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data: categoriesData } = useGetPolymarketCategories()
  const allCategories: IPolymarketCategory[] = categoriesData?.data ?? []
  const topCategories = allCategories.filter((c) => !c.parentCategory)

  // Sort at event level
  const sortedEvents = [...(events || [])].sort((a, b) => {
    if (sortBy === 'volume') {
      const volA = a.markets.reduce((sum, m) => sum + (m.volume || 0), 0)
      const volB = b.markets.reduce((sum, m) => sum + (m.volume || 0), 0)
      return volB - volA
    }
    if (sortBy === 'ending') {
      const endA = a.markets
        .filter((m) => m.end_date_iso)
        .map((m) => new Date(m.end_date_iso).getTime())
        .sort((x, y) => x - y)[0] || Number.MAX_SAFE_INTEGER
      const endB = b.markets
        .filter((m) => m.end_date_iso)
        .map((m) => new Date(m.end_date_iso).getTime())
        .sort((x, y) => x - y)[0] || Number.MAX_SAFE_INTEGER
      return endA - endB
    }
    return 0
  })

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!hasMore || isLoadingMore || isLoading) return

    let observer: IntersectionObserver | null = null

    const timeoutId = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
            onLoadMore()
          }
        },
        { threshold: 0, rootMargin: '200px' }
      )

      const currentTarget = sentinelRef.current
      if (currentTarget) {
        observer.observe(currentTarget)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [hasMore, isLoadingMore, isLoading, onLoadMore, sortedEvents.length])

  const renderFilters = (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent='space-between'
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Tabs
        value={category}
        onChange={(_, newValue) => onChangeCategory(newValue)}
        variant='scrollable'
        scrollButtons='auto'
        sx={{
          bgcolor: '#ebebeb',
          borderRadius: 50,
          p: 0.5,
          minHeight: 'auto',
          '& .MuiTab-root': {
            minWidth: 'auto',
            minHeight: 'auto',
            px: 2,
            py: 1,
            fontWeight: 600,
            fontSize: '0.85rem',
            fontFamily: "'Satoshi Variable', sans-serif",
            textTransform: 'none',
            borderRadius: 50,
            color: 'text.primary',
            '&.Mui-selected': {
              color: 'text.primary',
              bgcolor: 'background.paper',
              boxShadow: theme.customShadows?.z1 || '0px 6px 17px 0px rgba(0,0,0,0.08)',
            }
          },
          '& .MuiTabs-indicator': {
            display: 'none'
          }
        }}
      >
        <Tab label="All" value="All" />
        {topCategories.map((cat) => (
          <Tab key={cat.id} label={cat.label} value={cat.label} />
        ))}
      </Tabs>

      <Select
        size='small'
        value={sortBy}
        onChange={(e) => onChangeSortBy(e.target.value)}
        sx={{
          minWidth: 140,
          '& .MuiSelect-select': {
            py: 1,
            fontSize: '0.85rem'
          }
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
          <Grid xs={12} sm={6} md={4} lg={3} key={key}>
            {isSingleMarket ? (
              <PolymarketMarketCard market={event.markets[0]} compact />
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
