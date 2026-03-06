'use client'

import { useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import ListItemButton from '@mui/material/ListItemButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha, useTheme } from '@mui/material/styles'

import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'

import { useSearchPolymarkets } from 'src/app/api/hooks'

import Iconify from 'src/components/iconify'

import type { IPolymarketMarket } from 'src/types/polymarket'

// ----------------------------------------------------------------------

export default function PolymarketSearch() {
  const theme = useTheme()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showResults, setShowResults] = useState(false)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading } = useSearchPolymarkets(debouncedQuery)
  const results: IPolymarketMarket[] = Array.isArray(data?.data) ? data.data : []

  const handleSelect = useCallback(
    (slug: string) => {
      setShowResults(false)
      setQuery('')
      router.push(paths.dashboard.polymarket.detail(slug))
    },
    [router]
  )

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
      <TextField
        fullWidth
        size='small'
        placeholder='Search prediction markets...'
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setShowResults(true)
        }}
        onFocus={() => setShowResults(true)}
        onBlur={() => {
          // Delay to allow click on results
          setTimeout(() => setShowResults(false), 200)
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Iconify icon='eva:search-fill' sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
          endAdornment: isLoading ? (
            <InputAdornment position='end'>
              <CircularProgress size={18} />
            </InputAdornment>
          ) : null
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: alpha(theme.palette.grey[500], 0.08),
            '&:hover': {
              bgcolor: alpha(theme.palette.grey[500], 0.12)
            }
          }
        }}
      />

      {/* Results dropdown */}
      {showResults && debouncedQuery.trim() && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 0.5,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: theme.shadows[20],
            zIndex: 10,
            maxHeight: 320,
            overflow: 'auto',
            border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
          }}
        >
          {!isLoading && results.length === 0 && (
            <Stack alignItems='center' sx={{ py: 3 }}>
              <Typography variant='body2' color='text.secondary'>
                No markets found
              </Typography>
            </Stack>
          )}

          <List disablePadding>
            {results.map((market) => (
              <ListItemButton
                key={market.condition_id || market.slug}
                onClick={() => handleSelect(market.slug)}
                sx={{ px: 2, py: 1.5 }}
              >
                <Stack direction='row' alignItems='center' spacing={2} sx={{ width: '100%' }}>
                  {market.image && (
                    <Box
                      component='img'
                      src={market.image}
                      alt=''
                      sx={{
                        width: 40,
                        height: 32,
                        borderRadius: 1,
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <Stack flex={1} spacing={0.25}>
                    <Typography variant='subtitle2' noWrap>
                      {market.question}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {market.category}
                    </Typography>
                  </Stack>
                </Stack>
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}
    </Box>
  )
}
