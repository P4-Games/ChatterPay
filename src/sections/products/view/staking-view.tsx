'use client'

import { m, useScroll } from 'framer-motion'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import MainLayout from 'src/layouts/main'
import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'
import ScrollProgress from 'src/components/scroll-progress'

// ----------------------------------------------------------------------

const CARDANO_LOGO = '/assets/icons/networks/cardano.svg'

/** Shared reveal, so every block enters the same way as the rest of the product pages. */
const FADE_IN = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
  viewport: { once: true, margin: '-40px' }
} as const

/** The four steps of the automatic flow, in the order a wallet goes through them. */
const HOW_STEPS = [
  { id: 'receive', icon: 'solar:wallet-money-bold-duotone' },
  { id: 'delegate', icon: 'solar:refresh-circle-bold-duotone' },
  { id: 'rewards', icon: 'solar:chart-2-bold-duotone' },
  { id: 'control', icon: 'solar:settings-bold-duotone' }
] as const

/** How a staking balance splits, which is what the dashboard shows once staking is live. */
const BALANCE_PARTS = ['available', 'deposit', 'rewards'] as const

/** The governance copy, paragraph by paragraph: what it is, what ChatterPay does, what it is not. */
const GOVERNANCE_PARAGRAPHS = ['description', 'scope', 'distinction', 'rewards_link'] as const

// ----------------------------------------------------------------------

/** Cardano staking: what the automatic delegation does and what the user decides. */
export default function StakingView(): JSX.Element {
  const { scrollYProgress } = useScroll()
  const { t } = useTranslate()
  const theme = useTheme()

  const isDark = theme.palette.mode === 'dark'
  const cardSx = {
    p: 3,
    height: '100%',
    boxShadow: 'none',
    borderRadius: 2,
    border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
    bgcolor: isDark ? alpha(theme.palette.grey[900], 0.4) : 'common.white'
  }

  return (
    <MainLayout>
      <ScrollProgress scrollYProgress={scrollYProgress} />

      <Box sx={{ bgcolor: 'background.default' }}>
        {/* Hero */}
        <Box
          sx={{
            pt: { xs: 5, md: 8 },
            pb: { xs: 6, md: 10 },
            background: `radial-gradient(900px 520px at 80% 20%, ${alpha(
              theme.palette.primary.main,
              isDark ? 0.24 : 0.12
            )} 0%, transparent 60%)`
          }}
        >
          <Container>
            <Grid container spacing={{ xs: 4, md: 6 }} alignItems='center'>
              <Grid item xs={12} md={7}>
                <m.div {...FADE_IN}>
                  <Chip
                    label={t('products.staking-view.badge', 'In development')}
                    size='small'
                    color='warning'
                    sx={{ mb: 2 }}
                  />

                  <Typography variant='h2' sx={{ mb: 2 }}>
                    {t('products.staking-view.hero.title', 'Your ADA can earn rewards')}
                  </Typography>

                  <Typography sx={{ color: 'text.secondary', maxWidth: 560 }}>
                    {t(
                      'products.staking-view.hero.description',
                      'Delegate your ADA from ChatterPay and take part in the Cardano ecosystem. The funds stay in your wallet and you keep control of them.'
                    )}
                  </Typography>
                </m.div>
              </Grid>

              <Grid item xs={12} md={5}>
                <m.div {...FADE_IN}>
                  <Box
                    component='img'
                    src={CARDANO_LOGO}
                    alt=''
                    sx={{
                      display: 'block',
                      mx: 'auto',
                      width: { xs: 180, md: 260 },
                      height: 'auto'
                    }}
                  />
                </m.div>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* How it works */}
        <Container sx={{ pb: { xs: 6, md: 10 } }}>
          <m.div {...FADE_IN}>
            <Typography variant='h4' sx={{ mb: 3, fontWeight: 700 }}>
              {t('products.staking-view.how.title', 'How it works')}
            </Typography>
          </m.div>

          <Grid container spacing={3}>
            {HOW_STEPS.map((step) => (
              <Grid key={step.id} item xs={12} sm={6} md={3}>
                <m.div {...FADE_IN} style={{ height: '100%' }}>
                  <Card sx={cardSx}>
                    <Iconify icon={step.icon} width={28} sx={{ color: 'primary.main', mb: 1.5 }} />

                    <Typography variant='h6' sx={{ mb: 1 }}>
                      {t(`products.staking-view.how.${step.id}.title`)}
                    </Typography>

                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t(`products.staking-view.how.${step.id}.description`)}
                    </Typography>
                  </Card>
                </m.div>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* What the balance is made of */}
        <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
          <Container>
            <m.div {...FADE_IN}>
              <Typography variant='h4' sx={{ mb: 1, fontWeight: 700 }}>
                {t('products.staking-view.balance.title')}
              </Typography>

              <Typography sx={{ color: 'text.secondary', maxWidth: 720, mb: 3 }}>
                {t('products.staking-view.balance.description')}
              </Typography>
            </m.div>

            <Grid container spacing={3}>
              {BALANCE_PARTS.map((part) => (
                <Grid key={part} item xs={12} md={4}>
                  <m.div {...FADE_IN} style={{ height: '100%' }}>
                    <Card sx={cardSx}>
                      <Typography variant='subtitle1' sx={{ mb: 1 }}>
                        {t(`products.staking-view.balance.${part}.title`)}
                      </Typography>

                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {t(`products.staking-view.balance.${part}.description`)}
                      </Typography>
                    </Card>
                  </m.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Governance, kept apart from staking rewards */}
        <Container sx={{ py: { xs: 6, md: 10 } }}>
          <m.div {...FADE_IN}>
            <Card sx={{ ...cardSx, p: { xs: 3, md: 4 } }}>
              <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
                <Box
                  component='img'
                  src={CARDANO_LOGO}
                  alt=''
                  sx={{ width: 32, height: 32, display: 'block', flexShrink: 0 }}
                />

                <Typography variant='h4' sx={{ fontWeight: 700 }}>
                  {t('products.staking-view.governance.title')}
                </Typography>
              </Stack>

              <Stack spacing={2}>
                {GOVERNANCE_PARAGRAPHS.map((paragraph) => (
                  <Typography key={paragraph} sx={{ color: 'text.secondary' }}>
                    {t(`products.staking-view.governance.${paragraph}`)}
                  </Typography>
                ))}
              </Stack>
            </Card>
          </m.div>

          <m.div {...FADE_IN}>
            <Typography variant='caption' sx={{ display: 'block', mt: 3, color: 'text.disabled' }}>
              {t('products.staking-view.disclaimer')}
            </Typography>
          </m.div>
        </Container>
      </Box>
    </MainLayout>
  )
}
