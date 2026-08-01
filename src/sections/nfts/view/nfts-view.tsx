'use client'

import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import type { AuthUserType } from 'src/auth/types'
import { useAuthContext } from 'src/auth/hooks'
import { useGetWalletNfts } from 'src/app/api/hooks/'

import Iconify from 'src/components/iconify'
import { useSettingsContext } from 'src/components/settings'

import type { INFT } from 'src/types/wallet'

import NftList from '../nft-list'
import NftsHero from '../nfts-hero'

// ----------------------------------------------------------------------

/**
 * NFTs page: hero with collection count and latest mint, plus the gallery
 * grid. Shares the gradient-bleed layout of the other dashboard pages.
 * @returns {JSX.Element} NFTs view.
 */
export default function NftsView() {
  const { t } = useTranslate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const settings = useSettingsContext()
  const { user }: { user: AuthUserType } = useAuthContext()
  const [walletAddress, setWalletAddress] = useState<string>('')

  useEffect(() => {
    if (user?.wallet) {
      setWalletAddress(user.wallet)
    }
  }, [user])

  const { data: nfts, isLoading: loadingNfts }: { data: INFT[]; isLoading: boolean } =
    useGetWalletNfts(walletAddress)

  const loading = !walletAddress || loadingNfts
  const safeNfts: INFT[] = loading ? [] : (nfts ?? [])
  const isEmpty = !loading && safeNfts.length === 0

  return (
    <Box
      sx={{
        mt: -13,
        mx: { xs: 0, lg: -2 },
        minHeight: '100vh',
        bgcolor: isDark ? '#0A2E1A' : '#B8F6C9',
        backgroundImage: isDark
          ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 600px)'
          : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 600px)',
        pb: { xs: 10, md: 15 },
        mb: { xs: -10, md: -15 }
      }}
    >
      <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ pt: { xs: 15, md: 20 } }}>
        <Stack spacing={4}>
          <NftsHero nfts={safeNfts} loading={loading} />

          {loading ? (
            <Box
              gap={3}
              display='grid'
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
              }}
            >
              {[...Array(4)].map((_, index) => (
                <Card
                  key={index}
                  sx={{
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                    boxShadow: theme.customShadows.card,
                    overflow: 'hidden'
                  }}
                >
                  <Skeleton variant='rectangular' sx={{ width: '100%', aspectRatio: '1 / 1' }} />
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant='text' width='70%' />
                    <Skeleton variant='text' width='40%' />
                  </Box>
                </Card>
              ))}
            </Box>
          ) : isEmpty ? (
            <Card
              sx={{
                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                boxShadow: theme.customShadows.card
              }}
            >
              <Stack
                alignItems='center'
                justifyContent='center'
                spacing={1.5}
                sx={{ px: 3, py: 10 }}
              >
                <Iconify
                  icon='solar:gallery-add-bold-duotone'
                  width={48}
                  sx={{ color: 'text.disabled' }}
                />
                <Typography variant='subtitle2'>{t('nfts.empty-title')}</Typography>
                <Typography
                  variant='body2'
                  sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 360 }}
                >
                  {t('nfts.empty-description')}
                </Typography>
              </Stack>
            </Card>
          ) : (
            <NftList nfts={safeNfts} />
          )}
        </Stack>
      </Container>
    </Box>
  )
}
