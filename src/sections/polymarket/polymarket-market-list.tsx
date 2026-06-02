'use client'

import { useRef, useEffect, useCallback, useMemo, useState } from 'react'

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
import IconButton from '@mui/material/IconButton'
import { alpha, useTheme } from '@mui/material/styles'

import Iconify from 'src/components/iconify'
import { useTranslate } from 'src/locales'

import PolymarketMarketCard from './polymarket-market-card'
import PolymarketEventCard from './polymarket-event-card'

import type { IPolymarketEvent } from 'src/types/polymarket'
// ----------------------------------------------------------------------
const SORT_OPTIONS = [
  { value: 'recommended', label: 'polymarket.recommended' },
  { value: 'volume', label: 'polymarket.volume' },
  { value: 'newest', label: 'polymarket.newest' },
  { value: 'ending', label: 'polymarket.ending-soon' }
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

  const categoriesScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const HARDCODED_CATEGORIES = useMemo(
    () => [
      'politics',
      'sports',
      'crypto',
      'esports',
      'finance',
      'geopolitics',
      'tech',
      'pop-culture',
      'economy',
      'weather'
    ],
    []
  )

  const checkScrollState = useCallback(() => {
    const container = categoriesScrollRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    const isScrollable = scrollWidth > clientWidth

    setCanScrollLeft(isScrollable && scrollLeft > 0)
    setCanScrollRight(isScrollable && scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  const handleScroll = useCallback((direction: 'left' | 'right') => {
    const container = categoriesScrollRef.current
    if (!container) return

    const scrollAmount = 200
    const newScrollLeft =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount

    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    checkScrollState()

    const container = categoriesScrollRef.current
    if (!container) return

    const handleScrollEvent = () => checkScrollState()
    const resizeObserver = new ResizeObserver(checkScrollState)

    container.addEventListener('scroll', handleScrollEvent)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', handleScrollEvent)
      resizeObserver.disconnect()
    }
  }, [checkScrollState, HARDCODED_CATEGORIES])

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
  useEffect(
    () => () => {
      observerRef.current?.disconnect()
    },
    []
  )

  const renderFilters = (
    <Stack
      direction='row'
      alignItems='center'
      justifyContent='space-between'
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
        {canScrollLeft && (
          <IconButton
            size='small'
            onClick={() => handleScroll('left')}
            sx={{
              bgcolor: isDark ? alpha(theme.palette.grey[500], 0.12) : '#ebebeb',
              '&:hover': {
                bgcolor: isDark ? alpha(theme.palette.grey[500], 0.2) : '#ddd'
              }
            }}
          >
            <Iconify icon='eva:arrow-ios-back-fill' width={20} />
          </IconButton>
        )}

        <Box
          ref={categoriesScrollRef}
          sx={{
            display: 'inline-flex',
            gap: '2px',
            bgcolor: isDark ? alpha(theme.palette.grey[500], 0.12) : '#ebebeb',
            borderRadius: 50,
            p: 0.5,
            maxWidth: '100%',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          {['All', ...HARDCODED_CATEGORIES].map((slug) => {
            const isAll = slug === 'All'
            const value = slug
            const isActive = category === value

            return (
              <Chip
                key={value}
                label={isAll ? t('polymarket.all') : t(`polymarket.categories.${slug}`)}
                onClick={() => onChangeCategory(value)}
                sx={{
                  borderRadius: 50,
                  px: 0.5,
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.85rem',
                  fontFamily: "'Satoshi Variable', sans-serif",
                  bgcolor: isActive ? 'background.paper' : 'transparent',
                  boxShadow: isActive
                    ? theme.customShadows?.z1 || '0px 6px 17px 0px rgba(0,0,0,0.08)'
                    : 'none',
                  color: 'text.primary',
                  border: 'none',
                  transition: theme.transitions.create([
                    'background-color',
                    'box-shadow',
                    'font-weight'
                  ]),
                  '&:hover': {
                    bgcolor: isActive ? 'background.paper' : alpha(theme.palette.grey[500], 0.08)
                  }
                }}
              />
            )
          })}
        </Box>

        {canScrollRight && (
          <IconButton
            size='small'
            onClick={() => handleScroll('right')}
            sx={{
              bgcolor: isDark ? alpha(theme.palette.grey[500], 0.12) : '#ebebeb',
              '&:hover': {
                bgcolor: isDark ? alpha(theme.palette.grey[500], 0.2) : '#ddd'
              }
            }}
          >
            <Iconify icon='eva:arrow-ios-forward-fill' width={20} />
          </IconButton>
        )}
      </Box>

      <Select
        size='small'
        value={sortBy}
        onChange={(e) => onChangeSortBy(e.target.value)}
        startAdornment={
          <InputAdornment position='start'>
            <Iconify
              icon='solar:sort-vertical-bold'
              width={18}
              sx={{ color: 'text.secondary', ml: 0.5 }}
            />
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
            fontWeight: 600
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none'
          }
        }}
      >
        {SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {t(option.label)}
          </MenuItem>
        ))}
      </Select>
    </Stack>
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
