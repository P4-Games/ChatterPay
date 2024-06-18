import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import Image from 'src/components/image'
import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeCleanInterfaces() {
  const renderDescription = (
    <Stack
      spacing={3}
      sx={{
        maxWidth: 520,
        mx: 'auto',
        zIndex: { md: 99 },
        position: { md: 'absolute' },
        textAlign: { xs: 'center', md: 'left' }
      }}
    >
      <m.div variants={varFade().inUp}>
        <Typography component='div' variant='overline' sx={{ color: 'text.disabled' }}>
          clean & clear
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography
          variant='h2'
          sx={{
            textShadow: (theme) =>
              theme.palette.mode === 'light'
                ? 'unset'
                : `4px 4px 16px ${alpha(theme.palette.grey[800], 0.48)}`
          }}
        >
          Beautiful, modern and clean user interfaces
        </Typography>
      </m.div>
    </Stack>
  )

  const renderContent = (
    <Box sx={{ position: 'relative' }}>
      {[...Array(10)].map((_, index) => (
        <Box
          key={index}
          component={m.div}
          variants={varFade().inUp}
          sx={{
            top: 0,
            left: 0,
            position: 'absolute',
            ...(index === 0 && { zIndex: 8 }),
            ...(index === 9 && { position: 'relative', zIndex: 9 })
          }}
        >
          <Image
            disabledEffect
            alt={`clean-${index + 1}`}
            src={`/assets/images/home/clean/page_${index + 1}.webp`}
          />
        </Box>
      ))}
    </Box>
  )

  return (
    <Container
      component={MotionViewport}
      sx={{
        py: { xs: 10, md: 15 }
      }}
    >
      {renderDescription}
      {renderContent}
    </Container>
  )
}
