import { useRef, useState, useEffect } from 'react'
import { m, animate, useInView, useReducedMotion } from 'framer-motion'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { alpha, styled } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'

import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'

import { useTranslate } from 'src/locales'

// ----------------------------------------------------------------------

const GREEN_COLOR = 'hsla(147, 41%, 21%, 1)'
const CHAT_GREEN = '#25D366'

const StyledRoot = styled('div')(({ theme }) => ({
  backgroundColor: GREEN_COLOR,
  padding: 0,
  overflow: 'hidden',
  position: 'relative',
  borderRadius: '0 0 32px 32px'
}))

const formatCac = (value: number) => (value >= 10 ? `$${value.toFixed(0)}` : `$${value.toFixed(2)}`)

const CacCounter = () => {
  const { t } = useTranslate()
  const shouldReduceMotion = useReducedMotion()

  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [value, setValue] = useState(100)

  useEffect(() => {
    if (!isInView) return undefined

    if (shouldReduceMotion) {
      setValue(0.3)
      return undefined
    }

    const controls = animate(100, 0.3, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setValue(latest)
    })
    return () => controls.stop()
  }, [isInView, shouldReduceMotion])

  const settled = value <= 0.31

  return (
    <Box ref={ref} sx={{ textAlign: 'center' }}>
      <Typography
        sx={{
          fontSize: { xs: 20, md: 24 },
          fontWeight: 600,
          color: alpha('#FFFFFF', 0.35),
          textDecoration: 'line-through',
          textDecorationThickness: 2,
          mb: 1
        }}
      >
        $100 · {t('home.b2b-banner.cac_old')}
      </Typography>

      <Typography
        component='div'
        sx={{
          fontSize: { xs: 88, sm: 120, md: 140 },
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums',
          color: settled ? CHAT_GREEN : alpha('#FFFFFF', 0.9),
          transition: 'color 0.4s ease',
          textShadow: settled ? `0 0 80px ${alpha(CHAT_GREEN, 0.5)}` : 'none'
        }}
      >
        {formatCac(value)}
      </Typography>

      <Typography
        variant='overline'
        sx={{ color: alpha('#FFFFFF', 0.6), letterSpacing: 2, display: 'block', mt: 2 }}
      >
        {t('home.b2b-banner.cac_new')}
      </Typography>
    </Box>
  )
}

export default function HomeFiatTransfer() {
  const { t } = useTranslate()

  return (
    <StyledRoot>
      <Container
        sx={{
          position: 'relative'
        }}
      >
        <Grid
          container
          spacing={{ xs: 5, md: 3 }}
          alignItems='center'
          justifyContent='space-between'
          sx={{ position: 'relative' }}
        >
          <Grid
            xs={12}
            md={6}
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              pt: { xs: 8, md: 15 },
              pb: { xs: 2, md: 15 },
              px: { xs: 2, md: 4 }
            }}
          >
            <m.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              viewport={{ once: false, margin: '-100px' }}
            >
              <Typography
                variant='overline'
                sx={{ color: CHAT_GREEN, letterSpacing: 2, display: 'block', mb: 2 }}
              >
                {t('home.b2b-banner.eyebrow')}
              </Typography>
              <Typography
                variant='h3'
                sx={{
                  mb: 3,
                  color: 'common.white',
                  fontWeight: 700
                }}
              >
                {t('home.b2b-banner.title')}
              </Typography>
            </m.div>

            <m.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              viewport={{ once: false, margin: '-100px' }}
            >
              <Typography
                sx={{
                  mb: 4,
                  color: 'common.white',
                  opacity: 0.8
                }}
              >
                {t('home.b2b-banner.description')}
              </Typography>
            </m.div>

            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}
            >
              <m.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
                viewport={{ once: false, margin: '-100px' }}
              >
                <Button
                  component={RouterLink}
                  href={paths.products.b2b}
                  variant='contained'
                  endIcon={
                    <Box
                      component='img'
                      src='/assets/icons/home/landing_resources/button_arrow.svg'
                      alt='Arrow'
                      className='arrow-icon'
                      sx={{ width: 18, height: 18 }}
                    />
                  }
                  sx={{
                    backgroundColor: 'common.white',
                    color: GREEN_COLOR,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: 1.5,
                    '&:hover': {
                      backgroundColor: 'grey.100',
                      '& .arrow-icon': {
                        transform: 'translateX(3px)'
                      }
                    },
                    padding: (theme) => theme.spacing(1.2, 4),
                    '@media (max-width: 900px)': {
                      fontSize: '0.9rem'
                    },
                    '& .MuiButton-endIcon': {
                      marginLeft: 1
                    },
                    '& .arrow-icon': {
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }}
                >
                  {t('home.b2b-banner.button')}
                </Button>
              </m.div>
            </Box>
          </Grid>

          <Grid
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pt: { xs: 2, md: 15 },
              pb: { xs: 8, md: 15 },
              px: { xs: 2, md: 4 },
              minHeight: { xs: 200, md: 'auto' }
            }}
          >
            <m.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              viewport={{ once: false, margin: '-100px' }}
              style={{ width: '100%' }}
            >
              <CacCounter />
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </StyledRoot>
  )
}
