import { m } from 'framer-motion'

import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'

import { FEES_CONTENT } from './fees-content'
import { FEES_ANIMATIONS, FEES_VIEWPORT } from './fees-animations'

// ----------------------------------------------------------------------

export default function FeesDisclaimer() {
  const theme = useTheme()
  const { t } = useTranslate()
  const isDark = theme.palette.mode === 'dark'

  return (
    <m.div
      variants={FEES_ANIMATIONS.item}
      initial='hidden'
      whileInView='visible'
      viewport={FEES_VIEWPORT}
    >
      <Card
        sx={{
          p: { xs: 3, md: 4 },
          boxShadow: 'none',
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
          bgcolor: isDark
            ? alpha(theme.palette.grey[900], 0.4)
            : alpha(theme.palette.grey[500], 0.04)
        }}
      >
        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
          <Iconify
            icon='solar:shield-warning-bold-duotone'
            width={22}
            sx={{ color: 'text.secondary' }}
          />
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            {t('fees.disclaimer.title')}
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {FEES_CONTENT.disclaimer.map((item) => (
            <Typography key={item} variant='body2' sx={{ color: 'text.secondary' }}>
              {t(`fees.disclaimer.items.${item}`)}
            </Typography>
          ))}
        </Stack>
      </Card>
    </m.div>
  )
}
