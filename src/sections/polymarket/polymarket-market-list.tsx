'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Stack from '@mui/material/Stack'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

import PolymarketMarketCard from './polymarket-market-card'

import type { IPolymarketMarket } from 'src/types/polymarket'

// ----------------------------------------------------------------------

const CATEGORIES = ['All', 'Politics', 'Crypto', 'Sports', 'Science', 'Culture']
const SORT_OPTIONS = [
  { value: 'volume', label: 'Volume' },
  { value: 'newest', label: 'Newest' },
  { value: 'ending', label: 'Ending Soon' }
]

type Props = {
  markets: IPolymarketMarket[]
  isLoading: boolean
}

export default function PolymarketMarketList({ markets, isLoading }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('volume')

  const filteredMarkets = (markets || []).filter((market) => {
    if (category === 'All') return true
    return market.category?.toLowerCase() === category.toLowerCase()
  })

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    if (sortBy === 'volume') return (b.volume || 0) - (a.volume || 0)
    if (sortBy === 'ending') {
      const dateA = a.end_date_iso ? new Date(a.end_date_iso).getTime() : Number.MAX_SAFE_INTEGER
      const dateB = b.end_date_iso ? new Date(b.end_date_iso).getTime() : Number.MAX_SAFE_INTEGER
      return dateA - dateB
    }
    return 0
  })

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
        onChange={(_, newValue) => setCategory(newValue)}
        variant='scrollable'
        scrollButtons='auto'
        sx={{
          bgcolor: '#ebebeb', // Light grey pill wrapper from Figma
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
            borderRadius: 50, // Pill inner shape
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
        {CATEGORIES.map((cat) => (
          <Tab key={cat} label={cat} value={cat} />
        ))}
      </Tabs>

      <Select
        size='small'
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
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
      {sortedMarkets.map((market) => (
        <Grid xs={12} sm={6} md={4} lg={3} key={market.condition_id || market.slug}>
          <PolymarketMarketCard market={market} compact />
        </Grid>
      ))}
    </Grid>
  )

  return (
    <Box>
      {renderFilters}
      {isLoading && renderLoading}
      {!isLoading && sortedMarkets.length === 0 && renderEmpty}
      {!isLoading && sortedMarkets.length > 0 && renderList}
    </Box>
  )
}
