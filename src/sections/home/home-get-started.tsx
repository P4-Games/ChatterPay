import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import { Button, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

import { paths } from 'src/routes/paths'

import { useResponsive } from 'src/hooks/use-responsive'

import { bgGradient } from 'src/theme/css'
import { useTranslate } from 'src/locales'

import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeGetStarted() {
  const theme = useTheme()
  const mdUp = useResponsive('up', 'md')
  const { t } = useTranslate()

  const renderSignUpBtn = (
    <Box
      sx={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        mt: 3
      }}
    >
      <m.div variants={varFade().inUp}>
        <Button
          size='large'
          color='inherit'
          variant='contained'
          rel='noopener'
          href={paths.auth.jwt.register}
        >
          {t('home.get-started.cta')}
        </Button>
      </m.div>
    </Box>
  )

  const renderDescription = (
    <Box
      sx={{
        textAlign: {
          xs: 'center',
          md: 'left'
        }
      }}
    >
      <Box
        component={m.div}
        variants={varFade().inDown}
        sx={{ color: 'common.white', mb: mdUp ? 5 : 2, typography: 'h2' }}
      >
        {t('home.get-started.title')}
        <br /> ChatterPay
      </Box>

      <m.div variants={varFade().inDown}>
        <Typography sx={{ color: 'grey.400' }}>{t('home.get-started.description')}</Typography>
      </m.div>

      {renderSignUpBtn}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent={{ xs: 'center', md: 'flex-start' }}
        spacing={2}
      />
    </Box>
  )

  const renderImg = (
    <Stack component={m.div} variants={varFade().inUp} alignItems='center'>
      <Box
        component={m.img}
        animate={{
          y: [-20, 0, -20]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        alt='rocket'
        src='/assets/images/home/rocket.webp'
        sx={{ maxWidth: mdUp ? 460 : 380 }}
      />
    </Stack>
  )

  return (
    <Box
      sx={{
        py: { xs: 5, md: 15 },
        bgcolor: (th) => alpha(th.palette.grey[500], 0.04)
      }}
    >
      <Container component={MotionViewport}>
        <Stack
          alignItems='center'
          direction={{ xs: 'column', md: 'row' }}
          sx={{
            ...bgGradient({
              direction: '135deg',
              startColor: theme.palette.primary.main,
              endColor: theme.palette.primary.dark
            }),
            borderRadius: 2,
            mt: 5,
            pb: { xs: 12, md: 0 }
          }}
        >
          {renderImg}

          {renderDescription}
        </Stack>
      </Container>
    </Box>
  )
}
