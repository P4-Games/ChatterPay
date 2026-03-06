'use client'

import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'

import { useTranslate } from 'src/locales'

import { useSettingsContext } from 'src/components/settings'
import Iconify from 'src/components/iconify'

import PolymarketPortfolio from '../polymarket-portfolio'

// ----------------------------------------------------------------------

export default function PolymarketPortfolioView() {
  const { t } = useTranslate()
  const router = useRouter()
  const settings = useSettingsContext()

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
        >
          <Typography variant='h4' fontWeight={800}>
            {t('polymarket.portfolio-title')}
          </Typography>
          <Button
            variant='outlined'
            color='inherit'
            onClick={() => router.push(paths.dashboard.polymarket.root)}
            startIcon={<Iconify icon='solar:shop-bold' />}
          >
            {t('polymarket.browse-markets')}
          </Button>
        </Stack>

        <PolymarketPortfolio />
      </Stack>
    </Container>
  )
}
