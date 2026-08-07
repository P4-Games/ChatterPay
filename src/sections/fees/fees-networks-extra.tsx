import { useMemo } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useGetLifiChainsSummary } from 'src/app/api/hooks'

import { useTranslate } from 'src/locales'

import type { LifiChainSummary } from 'src/app/api/hooks'

// ----------------------------------------------------------------------

/** Scroll is the origin balance every cross-network transfer starts from, so it is not a destination. */
const ORIGIN_CHAIN_KEY = 'scl'

export default function FeesNetworksExtra() {
  const theme = useTheme()
  const { t } = useTranslate()

  const { data, isLoading, error } = useGetLifiChainsSummary()

  const chains: LifiChainSummary[] = useMemo(() => {
    const all: LifiChainSummary[] = data?.chains || []
    return all
      .filter((chain) => chain.key !== ORIGIN_CHAIN_KEY)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  // Nothing useful to show if LiFi is unreachable: the table above still stands on its own.
  if (isLoading || error || !chains.length) {
    return null
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
        {t('fees.sections.networks.other_networks', { total: chains.length })}
      </Typography>

      <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap' }}>
        {chains.map((chain) => (
          <Stack
            key={chain.key}
            direction='row'
            spacing={0.75}
            alignItems='center'
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.grey[500], 0.08)
            }}
          >
            <Box
              component='img'
              src={chain.logoURI}
              alt=''
              loading='lazy'
              sx={{ width: 18, height: 18, borderRadius: '50%' }}
            />
            <Typography variant='caption' sx={{ fontWeight: 600 }}>
              {chain.name}
            </Typography>
          </Stack>
        ))}
      </Box>

      <Typography variant='caption' sx={{ color: 'text.disabled' }}>
        {t('fees.sections.networks.other_networks_hint')}
      </Typography>
    </Stack>
  )
}
