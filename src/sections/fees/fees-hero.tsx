import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { fDate } from 'src/utils/format-time'

import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'

import { FEES_CONTENT } from './fees-content'
import { FEES_ANIMATIONS, FEES_VIEWPORT } from './fees-animations'

// ----------------------------------------------------------------------

export default function FeesHero() {
  const theme = useTheme()
  const { t } = useTranslate()

  return (
    <Stack
      component={m.div}
      variants={FEES_ANIMATIONS.container}
      initial='hidden'
      whileInView='visible'
      viewport={FEES_VIEWPORT}
      spacing={2.5}
      sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}
    >
      <m.div variants={FEES_ANIMATIONS.item}>
        <Typography variant='overline' sx={{ color: 'primary.main', letterSpacing: 2 }}>
          {t('fees.hero.eyebrow')}
        </Typography>
      </m.div>

      <m.div variants={FEES_ANIMATIONS.item}>
        <Typography variant='h2' sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
          {t('fees.hero.title')}
        </Typography>
      </m.div>

      <m.div variants={FEES_ANIMATIONS.item}>
        <Typography sx={{ color: 'text.secondary', maxWidth: 720, mx: 'auto' }}>
          {t('fees.hero.description')}
        </Typography>
      </m.div>

      <m.div variants={FEES_ANIMATIONS.item}>
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            gap: 0.75,
            mx: 'auto',
            borderRadius: 1,
            display: 'inline-flex',
            alignItems: 'center',
            color: 'text.secondary',
            bgcolor: alpha(theme.palette.grey[500], 0.08)
          }}
        >
          <Iconify icon='solar:calendar-mark-bold-duotone' width={18} />
          <Typography variant='caption'>
            {t('fees.hero.last_updated')} {fDate(FEES_CONTENT.lastUpdated, 'dd/MM/yyyy')}
          </Typography>
        </Box>
      </m.div>
    </Stack>
  )
}
