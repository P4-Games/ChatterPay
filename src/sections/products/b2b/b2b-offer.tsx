import { m } from 'framer-motion'
import type { Variants } from 'framer-motion'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'
import { MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

const CHAT_GREEN = '#25D366'

const OFFER_ITEMS = [
  { key: 'payments', icon: 'solar:card-transfer-bold-duotone' },
  { key: 'agents', icon: 'solar:magic-stick-bold-duotone' },
  { key: 'crm', icon: 'solar:users-group-rounded-bold-duotone' },
  { key: 'marketing', icon: 'solar:chart-2-bold-duotone' },
  { key: 'security', icon: 'solar:shield-check-bold-duotone' },
  { key: 'defi', icon: 'solar:link-round-bold' }
] as const

const ANIMATIONS: Record<string, Variants> = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  },
  item: {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
    }
  }
}

// ----------------------------------------------------------------------

/** White-label capability grid: what partners get out of the box. */
export default function B2BOffer() {
  const theme = useTheme()
  const { t } = useTranslate()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <Container component={MotionViewport} sx={{ py: { xs: 10, md: 15 } }}>
        <m.div
          variants={ANIMATIONS.item}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          <Stack sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
            <Typography variant='overline' sx={{ color: 'primary.main', letterSpacing: 2 }}>
              {t('b2b.offer.eyebrow')}
            </Typography>

            <Typography
              variant='h2'
              sx={{ fontWeight: 800, letterSpacing: '-0.01em', mt: 1, mb: 2 }}
            >
              {t('b2b.offer.title')}
            </Typography>

            <Typography sx={{ color: 'text.secondary', maxWidth: 640, mx: 'auto' }}>
              {t('b2b.offer.description')}
            </Typography>
          </Stack>
        </m.div>

        <m.div
          variants={ANIMATIONS.container}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.2 }}
        >
          <Grid container spacing={3}>
            {OFFER_ITEMS.map((item) => (
              <Grid key={item.key} xs={12} sm={6} md={4}>
                <m.div variants={ANIMATIONS.item} style={{ height: '100%' }}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 4,
                      borderRadius: 4,
                      boxShadow: 'none',
                      bgcolor: isDark ? '#1A2420' : 'common.white',
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
                      transition: theme.transitions.create(['transform', 'border-color'], {
                        duration: theme.transitions.duration.shorter
                      }),
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: alpha(CHAT_GREEN, 0.5)
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                        color: isDark ? CHAT_GREEN : 'primary.main',
                        bgcolor: alpha(CHAT_GREEN, isDark ? 0.12 : 0.14)
                      }}
                    >
                      <Iconify icon={item.icon} width={26} />
                    </Box>

                    <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
                      {t(`b2b.offer.${item.key}.title`)}
                    </Typography>

                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t(`b2b.offer.${item.key}.description`)}
                    </Typography>
                  </Card>
                </m.div>
              </Grid>
            ))}
          </Grid>
        </m.div>
      </Container>
    </Box>
  )
}
