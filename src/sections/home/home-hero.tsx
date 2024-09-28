import { m, useScroll } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import { alpha, styled, useTheme } from '@mui/material/styles'

import { useResponsive } from 'src/hooks/use-responsive'

import { useTranslate } from 'src/locales'
import { HEADER } from 'src/layouts/config-layout'
import { bgBlur, bgGradient, textGradient } from 'src/theme/css'

import { varFade, MotionContainer } from 'src/components/animate'
// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  ...bgGradient({
    color: alpha(theme.palette.background.default, theme.palette.mode === 'light' ? 0.9 : 0.94),
    imgUrl: '/assets/images/background/overlay_3.jpg'
  }),
  width: '100%',
  height: '100vh',
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    top: 0,
    left: 0,
    position: 'fixed'
  }
}))

const StyledWrapper = styled('div')(({ theme }) => ({
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    marginTop: HEADER.H_DESKTOP_OFFSET
  }
}))

const StyledTextGradient = styled(m.h1)(({ theme }) => ({
  ...textGradient(
    `300deg, ${theme.palette.primary.main} 0%, ${theme.palette.warning.main} 25%, ${theme.palette.primary.main} 50%, ${theme.palette.warning.main} 75%, ${theme.palette.primary.main} 100%`
  ),
  padding: 0,
  marginTop: 8,
  lineHeight: 1,
  fontWeight: 900,
  marginBottom: 24,
  letterSpacing: 8,
  textAlign: 'center',
  backgroundSize: '400%',
  fontSize: `${64 / 16}rem`,
  fontFamily: theme.typography.fontSecondaryFamily,
  [theme.breakpoints.up('md')]: {
    fontSize: `${96 / 16}rem`
  }
}))

const StyledEllipseTop = styled('div')(({ theme }) => ({
  top: -80,
  width: 480,
  right: -80,
  height: 480,
  borderRadius: '50%',
  position: 'absolute',
  filter: 'blur(100px)',
  WebkitFilter: 'blur(100px)',
  backgroundColor: alpha(theme.palette.primary.darker, 0.12)
}))

const StyledEllipseBottom = styled('div')(({ theme }) => ({
  height: 400,
  bottom: -200,
  left: '10%',
  right: '10%',
  borderRadius: '50%',
  position: 'absolute',
  filter: 'blur(100px)',
  WebkitFilter: 'blur(100px)',
  backgroundColor: alpha(theme.palette.primary.darker, 0.12)
}))

type StyledPolygonProps = {
  opacity?: number
  anchor?: 'left' | 'right'
}

const StyledPolygon = styled('div')<StyledPolygonProps>(
  ({ opacity = 1, anchor = 'left', theme }) => ({
    ...bgBlur({
      opacity,
      color: theme.palette.background.default
    }),
    zIndex: 9,
    bottom: 0,
    height: 80,
    width: '50%',
    position: 'absolute',
    clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)',
    ...(anchor === 'left' && {
      left: 0,
      ...(theme.direction === 'rtl' && {
        transform: 'scale(-1, 1)'
      })
    }),
    ...(anchor === 'right' && {
      right: 0,
      transform: 'scaleX(-1)',
      ...(theme.direction === 'rtl' && {
        transform: 'scaleX(1)'
      })
    })
  })
)

// ----------------------------------------------------------------------

export default function HomeHero() {
  const { t } = useTranslate()

  const mdUp = useResponsive('up', 'md')

  const theme = useTheme()

  const heroRef = useRef<HTMLDivElement | null>(null)

  const { scrollY } = useScroll()

  const [percent, setPercent] = useState(0)

  const lightMode = theme.palette.mode === 'light'

  const getScroll = useCallback(() => {
    let heroHeight = 0

    if (heroRef.current) {
      heroHeight = heroRef.current.offsetHeight
    }

    scrollY.on('change', (scrollHeight) => {
      const scrollPercent = (scrollHeight * 100) / heroHeight

      setPercent(Math.floor(scrollPercent))
    })
  }, [scrollY])

  useEffect(() => {
    getScroll()
  }, [getScroll])

  const transition = {
    repeatType: 'loop',
    ease: 'linear',
    duration: 60 * 4,
    repeat: Infinity
  } as const

  const opacity = 1 - percent / 100

  const hide = percent > 120

  const renderDescription = (
    <Stack
      alignItems='center'
      justifyContent='center'
      sx={{
        height: 1,
        mx: 'auto',
        maxWidth: 480,
        opacity: opacity > 0 ? opacity : 0,
        mt: {
          md: `-${HEADER.H_DESKTOP + percent * 2.5}px`
        }
      }}
    >
      <m.div variants={varFade().in}>
        <Typography
          variant='h2'
          sx={{
            textAlign: 'center',
            mb: mdUp ? 0 : 5
          }}
        >
          {t('home.hero.title1')} <br />
          {t('home.hero.title2')}
        </Typography>
      </m.div>

      <m.div variants={varFade().in}>
        <StyledTextGradient
          animate={{ backgroundPosition: '200% center' }}
          transition={{
            repeatType: 'reverse',
            ease: 'linear',
            duration: 20,
            repeat: Infinity
          }}
          sx={{ fontSize: mdUp ? '64px' : '54px' }}
        >
          ChatterPay
        </StyledTextGradient>
      </m.div>

      <m.div variants={varFade().in}>
        <Typography variant='body2' sx={{ textAlign: 'center', mb: 5 }}>
          {t('home.hero.legend')}
        </Typography>
      </m.div>

      {!mdUp && (
        <m.div variants={varFade().in}>
          <Box
            component={m.img}
            src='/assets/images/home/logo.webp'
            alt='chatterpay'
            sx={{
              mt: 0,
              width: '80%',
              borderRadius: '50%',
              display: 'block', // Asegura que el margin auto funcione
              mx: 'auto' // Centra la imagen horizontalmente
            }}
          />{' '}
        </m.div>
      )}
    </Stack>
  )

  const renderSlides = (
    <Stack
      direction='row'
      alignItems='flex-start'
      spacing={7}
      sx={{
        height: '150%',
        position: 'absolute',
        opacity: opacity > 0 ? opacity : 0,
        transform: `skew(${-16 - percent / 24}deg, ${4 - percent / 16}deg)`,
        ...(theme.direction === 'rtl' && {
          transform: `skew(${16 + percent / 24}deg, ${4 + percent / 16}deg)`
        })
      }}
    >
      <Stack
        component={m.div}
        variants={varFade().in}
        sx={{
          width: 280, // original: 344
          position: 'relative'
        }}
      >
        <Box
          component={m.img}
          animate={{ y: ['0%', '100%'] }}
          transition={transition}
          alt={lightMode ? 'light_1' : 'dark_1'}
          src={
            lightMode
              ? `/assets/images/home/hero/light_1.webp`
              : `/assets/images/home/hero/dark_1.webp`
          }
          sx={{ position: 'absolute', mt: -5 }}
        />
        <Box
          component={m.img}
          animate={{ y: ['-100%', '0%'] }}
          transition={transition}
          alt={lightMode ? 'light_1' : 'dark_1'}
          src={
            lightMode
              ? `/assets/images/home/hero/light_1.webp`
              : `/assets/images/home/hero/dark_1.webp`
          }
          sx={{ position: 'absolute' }}
        />
      </Stack>

      <Stack
        component={m.div}
        variants={varFade().in}
        sx={{ width: 600, position: 'relative', ml: -5 }} // original: width: 720
      >
        <Box
          component={m.img}
          animate={{ y: ['100%', '0%'] }}
          transition={transition}
          alt={lightMode ? 'light_2' : 'dark_2'}
          src={
            lightMode
              ? `/assets/images/home/hero/light_2.webp`
              : `/assets/images/home/hero/dark_2.webp`
          }
          sx={{ position: 'absolute', mt: -5 }}
        />
        <Box
          component={m.img}
          animate={{ y: ['0%', '-100%'] }}
          transition={transition}
          alt={lightMode ? 'light_2' : 'dark_2'}
          src={
            lightMode
              ? `/assets/images/home/hero/light_2.webp`
              : `/assets/images/home/hero/dark_2.webp`
          }
          sx={{ position: 'absolute' }}
        />
      </Stack>
    </Stack>
  )

  const renderPolygons = (
    <>
      <StyledPolygon />
      <StyledPolygon anchor='right' opacity={1} />
      <StyledPolygon anchor='right' opacity={1} sx={{ height: 48, zIndex: 10 }} />
      <StyledPolygon anchor='right' sx={{ zIndex: 11, height: 24 }} />
    </>
  )

  const renderEllipses = (
    <>
      {mdUp && <StyledEllipseTop />}
      <StyledEllipseBottom />
    </>
  )

  return (
    <>
      <StyledRoot
        ref={heroRef}
        sx={{
          ...(hide && {
            opacity: 0
          })
        }}
      >
        <StyledWrapper>
          <Container component={MotionContainer} sx={{ height: 1 }}>
            <Grid container columnSpacing={{ md: 10 }} sx={{ height: 1 }}>
              <Grid xs={12} md={6}>
                {renderDescription}
              </Grid>

              {mdUp && <Grid md={6}>{renderSlides}</Grid>}
            </Grid>
          </Container>

          {renderEllipses}
        </StyledWrapper>
      </StyledRoot>

      {mdUp && renderPolygons}

      <Box sx={{ height: { md: '100vh' } }} />
    </>
  )
}
