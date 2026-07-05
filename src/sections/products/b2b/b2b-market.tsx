import { m } from 'framer-motion'
import type { Variants } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'
import { MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

const STATS = ['stat1', 'stat2', 'stat3'] as const

const PROOF_ITEMS = [
  { key: 'proof1', icon: 'solar:wallet-bold-duotone' },
  { key: 'proof2', icon: 'solar:map-point-bold' },
  { key: 'proof3', icon: 'solar:shield-check-bold-duotone' }
] as const

const ANIMATIONS: Record<string, Variants> = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } }
  },
  item: {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  }
}

// ----------------------------------------------------------------------

/** Market size stats plus the traction strip that validates the rail. */
export default function B2BMarket() {
  const theme = useTheme()
  const { t } = useTranslate()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ bgcolor: isDark ? '#161C24' : '#F7FAF8' }}>
      <Container component={MotionViewport} sx={{ py: { xs: 10, md: 15 } }}>
        <m.div
          variants={ANIMATIONS.item}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          <Stack sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
            <Typography variant='overline' sx={{ color: 'primary.main', letterSpacing: 2 }}>
              {t('b2b.market.eyebrow')}
            </Typography>

            <Typography variant='h2' sx={{ fontWeight: 800, letterSpacing: '-0.01em', mt: 1 }}>
              {t('b2b.market.title')}
            </Typography>
          </Stack>
        </m.div>

        <m.div
          variants={ANIMATIONS.container}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.3 }}
        >
          <Grid container spacing={{ xs: 5, md: 4 }}>
            {STATS.map((stat) => (
              <Grid key={stat} xs={12} md={4}>
                <m.div variants={ANIMATIONS.item}>
                  <Box
                    sx={{
                      textAlign: { xs: 'center', md: 'left' },
                      pt: 3,
                      borderTop: `2px solid ${alpha(theme.palette.grey[500], 0.24)}`
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: 48, md: 56 },
                        fontWeight: 800,
                        lineHeight: 1,
                        letterSpacing: '-0.03em',
                        color: 'text.primary'
                      }}
                    >
                      {t(`b2b.market.${stat}.value`)}
                    </Typography>

                    <Typography variant='subtitle1' sx={{ fontWeight: 700, mt: 1.5 }}>
                      {t(`b2b.market.${stat}.label`)}
                    </Typography>

                    <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
                      {t(`b2b.market.${stat}.note`)}
                    </Typography>
                  </Box>
                </m.div>
              </Grid>
            ))}
          </Grid>
        </m.div>

        <Divider sx={{ my: { xs: 6, md: 8 } }} />

        {/* Traction strip */}
        <m.div
          variants={ANIMATIONS.container}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.3 }}
        >
          <Grid container spacing={3}>
            {PROOF_ITEMS.map((item) => (
              <Grid key={item.key} xs={12} md={4}>
                <m.div variants={ANIMATIONS.item}>
                  <Stack spacing={1} alignItems='center' sx={{ textAlign: 'center' }}>
                    <Iconify icon={item.icon} width={28} sx={{ color: 'primary.main' }} />
                    <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                      {t(`b2b.market.${item.key}.title`)}
                    </Typography>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      {t(`b2b.market.${item.key}.note`)}
                    </Typography>
                  </Stack>
                </m.div>
              </Grid>
            ))}
          </Grid>
        </m.div>
      </Container>
    </Box>
  )
}
