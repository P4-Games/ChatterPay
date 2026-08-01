import { m } from 'framer-motion'
import type { Variants } from 'framer-motion'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'
import { MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

const PINE = 'hsla(147, 41%, 21%, 1)'
const CHAT_GREEN = '#25D366'

const STEPS = ['step1', 'step2', 'step3'] as const

const ANIMATIONS: Record<string, Variants> = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.25 } }
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

/** "Onboarding without permission": every transfer creates the next wallet. */
export default function B2BLoop() {
  const theme = useTheme()
  const { t } = useTranslate()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <Container component={MotionViewport} sx={{ py: { xs: 10, md: 15 } }}>
        <Stack sx={{ textAlign: 'center', mb: { xs: 6, md: 10 }, alignItems: 'center' }}>
          <m.div
            variants={ANIMATIONS.item}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
          >
            <Typography variant='overline' sx={{ color: 'primary.main', letterSpacing: 2 }}>
              {t('b2b.loop.eyebrow')}
            </Typography>

            <Typography
              variant='h2'
              sx={{ fontWeight: 800, letterSpacing: '-0.01em', mt: 1, mb: 2 }}
            >
              {t('b2b.loop.title')}
            </Typography>

            <Typography sx={{ color: 'text.secondary', maxWidth: 620, mx: 'auto' }}>
              {t('b2b.loop.description')}
            </Typography>
          </m.div>
        </Stack>

        <m.div
          variants={ANIMATIONS.container}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.3 }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 1.5, md: 2 }}
            alignItems='stretch'
          >
            {STEPS.map((step, index) => (
              <Stack
                key={step}
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 1.5, md: 2 }}
                alignItems='center'
                sx={{ flex: 1 }}
              >
                <m.div variants={ANIMATIONS.item} style={{ width: '100%', height: '100%' }}>
                  <Box
                    sx={{
                      height: '100%',
                      p: { xs: 3.5, md: 4 },
                      borderRadius: 4,
                      bgcolor: isDark ? '#1A2420' : '#F1F8F3',
                      border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: isDark ? CHAT_GREEN : PINE,
                        mb: 1.5,
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Typography>

                    <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
                      {t(`b2b.loop.${step}.title`)}
                    </Typography>

                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t(`b2b.loop.${step}.description`)}
                    </Typography>
                  </Box>
                </m.div>

                {index < STEPS.length - 1 && (
                  <m.div variants={ANIMATIONS.item}>
                    <Iconify
                      icon='eva:arrow-forward-fill'
                      width={24}
                      sx={{
                        color: 'text.disabled',
                        flexShrink: 0,
                        transform: { xs: 'rotate(90deg)', md: 'none' }
                      }}
                    />
                  </m.div>
                )}
              </Stack>
            ))}
          </Stack>
        </m.div>

        <Stack alignItems='center' sx={{ mt: { xs: 5, md: 7 } }}>
          <m.div
            variants={ANIMATIONS.item}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
          >
            <Chip
              label={t('b2b.loop.tag')}
              sx={{
                fontWeight: 700,
                px: 1,
                color: isDark ? CHAT_GREEN : PINE,
                bgcolor: alpha(CHAT_GREEN, isDark ? 0.12 : 0.16),
                border: `1px solid ${alpha(CHAT_GREEN, 0.35)}`
              }}
            />
          </m.div>
        </Stack>
      </Container>
    </Box>
  )
}
