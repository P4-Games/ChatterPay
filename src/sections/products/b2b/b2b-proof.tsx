import { m } from 'framer-motion'
import type { Variants } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'
import { MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

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
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  }
}

// ----------------------------------------------------------------------

/** Traction strip right below the hero: production proof before the pitch. */
export default function B2BProof() {
  const theme = useTheme()
  const { t } = useTranslate()

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
      }}
    >
      <Container component={MotionViewport} sx={{ py: { xs: 5, md: 6 } }}>
        <m.div
          variants={ANIMATIONS.container}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.4 }}
        >
          <Grid container spacing={3}>
            {PROOF_ITEMS.map((item) => (
              <Grid key={item.key} xs={12} md={4}>
                <m.div variants={ANIMATIONS.item}>
                  <Stack spacing={0.5} alignItems='center' sx={{ textAlign: 'center' }}>
                    <Iconify icon={item.icon} width={28} sx={{ color: 'primary.main' }} />
                    <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                      {t(`b2b.proof.${item.key}.title`)}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {t(`b2b.proof.${item.key}.note`)}
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
