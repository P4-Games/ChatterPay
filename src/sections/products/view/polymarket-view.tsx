'use client'

import { m, useScroll } from 'framer-motion'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'

import MainLayout from 'src/layouts/main'
import { useTranslate } from 'src/locales'

import ScrollProgress from 'src/components/scroll-progress'

// ----------------------------------------------------------------------

type MockMarketCardProps = {
  emoji: string
  question: string
  yesPercent: number
  rotate: number
  liftY: number
  overlap: boolean
  zIndex: number
}

/**
 * Purely decorative, non-interactive market-card mockup — this is a static
 * marketing page (no live Polymarket data fetched here), so the "trending
 * markets" visual is illustrative rather than tied to real data.
 */
function MockMarketCard({
  emoji,
  question,
  yesPercent,
  rotate,
  liftY,
  overlap,
  zIndex
}: MockMarketCardProps) {
  const theme = useTheme()

  return (
    <Card
      component={m.div}
      initial={{ opacity: 0, y: 24, rotate: 0 }}
      whileInView={{ opacity: 1, y: liftY, rotate }}
      transition={{ duration: 0.5, delay: zIndex * 0.08 }}
      viewport={{ once: false, margin: '-20px' }}
      whileHover={{ rotate: 0, y: liftY - 6, zIndex: 10 }}
      sx={{
        zIndex,
        width: 220,
        flexShrink: 0,
        p: 2,
        ml: { xs: 0, sm: overlap ? -4 : 0 },
        mb: { xs: 2, sm: 0 },
        textAlign: 'left',
        boxShadow: theme.customShadows?.z20 || theme.shadows[8],
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
      }}
    >
      <Typography variant='h5' sx={{ mb: 0.5 }}>
        {emoji}
      </Typography>
      <Typography variant='body2' sx={{ fontWeight: 600, mb: 1.5, minHeight: 40 }}>
        {question}
      </Typography>
      <Stack direction='row' alignItems='center' spacing={1}>
        <Box
          sx={{
            flexGrow: 1,
            height: 6,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.error.main, 0.16),
            overflow: 'hidden'
          }}
        >
          <Box sx={{ width: `${yesPercent}%`, height: 1, bgcolor: 'success.main' }} />
        </Box>
        <Typography variant='caption' fontWeight={700} color='success.main'>
          {yesPercent}%
        </Typography>
      </Stack>
    </Card>
  )
}

export default function PolymarketView(): JSX.Element {
  const { scrollYProgress } = useScroll()
  const { t } = useTranslate()

  return (
    <MainLayout>
      <ScrollProgress scrollYProgress={scrollYProgress} />

      <Box sx={{ bgcolor: 'background.default' }}>
        {/* Hero Section */}
        <Box
          sx={{
            pt: { xs: 5, md: 8 },
            pb: { xs: 6, md: 10 },
            textAlign: 'center'
          }}
        >
          <Container>
            <m.div
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: false, margin: '-20px' }}
            >
              <Typography component='div' variant='overline' sx={{ color: 'text.disabled', mb: 1 }}>
                {t('products.hero.tag', 'Products')}
              </Typography>
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              viewport={{ once: false, margin: '-20px' }}
            >
              <Typography variant='h2' sx={{ mb: 1 }}>
                {t('products.hero.polymarket.title', 'Polymarket')}
              </Typography>

              <Typography variant='body2' sx={{ mb: 3, color: 'text.disabled' }}>
                {t(
                  'products.polymarket-view.status',
                  '🔮 Available now from your ChatterPay wallet.'
                )}
              </Typography>

              <Typography sx={{ maxWidth: 720, mx: 'auto', color: 'text.secondary', mb: 4 }}>
                {t(
                  'products.hero.polymarket.description',
                  'Trade prediction markets on real-world events, right from your ChatterPay wallet.'
                )}
              </Typography>

              <Button
                component={RouterLink}
                href={paths.dashboard.polymarket.root}
                variant='contained'
                size='large'
              >
                {t('products.polymarket-view.cta', 'Try Polymarket')}
              </Button>
            </m.div>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'center',
                alignItems: { xs: 'center', sm: 'flex-start' },
                mt: { xs: 6, sm: 8 },
                px: { sm: 4 }
              }}
            >
              <MockMarketCard
                emoji='🚀'
                question={t(
                  'products.polymarket-view.example-markets.1',
                  'Will NASA confirm signs of life on Mars by 2030?'
                )}
                yesPercent={62}
                rotate={-8}
                liftY={10}
                overlap={false}
                zIndex={1}
              />
              <MockMarketCard
                emoji='🪙'
                question={t(
                  'products.polymarket-view.example-markets.2',
                  'Will BTC close above $100k this month?'
                )}
                yesPercent={47}
                rotate={-3}
                liftY={0}
                overlap
                zIndex={2}
              />
              <MockMarketCard
                emoji='🗳️'
                question={t(
                  'products.polymarket-view.example-markets.3',
                  'Who wins the next election?'
                )}
                yesPercent={54}
                rotate={4}
                liftY={0}
                overlap
                zIndex={2}
              />
              <MockMarketCard
                emoji='🎬'
                question={t(
                  'products.polymarket-view.example-markets.4',
                  'Will this movie win Best Picture?'
                )}
                yesPercent={38}
                rotate={9}
                liftY={10}
                overlap
                zIndex={1}
              />
            </Box>
          </Container>
        </Box>
      </Box>
    </MainLayout>
  )
}
