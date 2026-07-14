'use client'

import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import { alpha, useTheme } from '@mui/material/styles'

import Iconify from 'src/components/iconify'
import { useTranslate } from 'src/locales'
import { useBoolean } from 'src/hooks/use-boolean'

// ----------------------------------------------------------------------

const FILTER_CONTROL_HEIGHT = 40

const SORT_OPTIONS = [
  { value: 'recommended', label: 'polymarket.recommended' },
  { value: 'volume', label: 'polymarket.volume' },
  { value: 'newest', label: 'polymarket.newest' },
  { value: 'ending', label: 'polymarket.ending-soon' }
]

type SearchProps = {
  searchQuery: string
  onChangeSearchQuery: (query: string) => void
}

/**
 * Expandable search control: icon button that animates into a text field.
 * @param {SearchProps} props - Query value and change handler.
 * @returns {JSX.Element} The animated search control.
 */
function MarketSearchField({ searchQuery, onChangeSearchQuery }: SearchProps) {
  const { t } = useTranslate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const searchOpen = useBoolean()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isSearchExpanded = searchOpen.value || !!searchQuery

  const handleOpenSearch = useCallback(() => {
    searchOpen.onTrue()
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }, [searchOpen])

  const handleCloseSearch = useCallback(() => {
    onChangeSearchQuery('')
    searchOpen.onFalse()
  }, [onChangeSearchQuery, searchOpen])

  const handleBlurSearch = useCallback(() => {
    if (!searchQuery) searchOpen.onFalse()
  }, [searchQuery, searchOpen])

  const pillBgcolor = isDark ? alpha(theme.palette.grey[500], 0.12) : '#ebebeb'

  return (
    <AnimatePresence mode='wait' initial={false}>
      {isSearchExpanded ? (
        <Box
          key='search-field'
          component={m.div}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 220, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          sx={{ overflow: 'hidden', flexShrink: 0 }}
        >
          <TextField
            inputRef={searchInputRef}
            size='small'
            value={searchQuery}
            onChange={(e) => onChangeSearchQuery(e.target.value)}
            onBlur={handleBlurSearch}
            placeholder={t('polymarket.search-placeholder')}
            sx={{
              width: 220,
              '& .MuiOutlinedInput-root': {
                height: FILTER_CONTROL_HEIGHT,
                borderRadius: 50,
                bgcolor: pillBgcolor,
                '& fieldset': { border: 'none' }
              },
              '& .MuiOutlinedInput-input': { py: 0 }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Iconify icon='eva:search-fill' width={20} sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={handleCloseSearch}>
                    <Iconify icon='eva:close-fill' width={18} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      ) : (
        <Box
          key='search-icon'
          component={m.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          sx={{ flexShrink: 0 }}
        >
          <IconButton
            onClick={handleOpenSearch}
            sx={{
              width: FILTER_CONTROL_HEIGHT,
              height: FILTER_CONTROL_HEIGHT,
              bgcolor: pillBgcolor,
              '&:hover': { bgcolor: isDark ? alpha(theme.palette.grey[500], 0.2) : '#ddd' }
            }}
          >
            <Iconify icon='eva:search-fill' width={20} sx={{ color: 'text.secondary' }} />
          </IconButton>
        </Box>
      )}
    </AnimatePresence>
  )
}

// ----------------------------------------------------------------------

type Props = {
  category: string
  onChangeCategory: (category: string) => void
  sortBy: string
  onChangeSortBy: (sortBy: string) => void
  searchQuery: string
  onChangeSearchQuery: (query: string) => void
  /** Dims and locks the category chips while search results are shown. */
  disabled?: boolean
}

/**
 * Filter bar for the market list: scrollable category chips, expandable
 * search field and sort select.
 * @param {Props} props - Filter values and change handlers.
 * @returns {JSX.Element} The toolbar row.
 */
export default function PolymarketMarketToolbar({
  category,
  onChangeCategory,
  sortBy,
  onChangeSortBy,
  searchQuery,
  onChangeSearchQuery,
  disabled = false
}: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

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

  return (
    <Stack
      direction='row'
      alignItems='center'
      justifyContent='space-between'
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flex: 1,
          minWidth: 0,
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          transition: theme.transitions.create('opacity')
        }}
      >
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

      <Stack direction='row' alignItems='center' spacing={1} sx={{ flexShrink: 0 }}>
        <MarketSearchField searchQuery={searchQuery} onChangeSearchQuery={onChangeSearchQuery} />

        <Select
          size='small'
          value={sortBy}
          onChange={(e) => onChangeSortBy(e.target.value)}
          renderValue={(value) => {
            const option = SORT_OPTIONS.find((o) => o.value === value)
            return (
              <Box component='span' sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {option ? t(option.label) : ''}
              </Box>
            )
          }}
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
            minWidth: { xs: 0, sm: 150 },
            height: FILTER_CONTROL_HEIGHT,
            flexShrink: 0,
            borderRadius: 50,
            bgcolor: isDark ? alpha(theme.palette.grey[500], 0.12) : '#ebebeb',
            '& .MuiSelect-select': {
              py: 0,
              pl: '0 !important',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center'
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
    </Stack>
  )
}
