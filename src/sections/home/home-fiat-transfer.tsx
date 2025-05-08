import { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'

// ----------------------------------------------------------------------

const GREEN_COLOR = 'hsla(147, 41%, 21%, 1)'

const StyledRoot = styled('div')(({ theme }) => ({
  backgroundColor: GREEN_COLOR,
  padding: 0,
  overflow: 'hidden',
  position: 'relative',
  borderRadius: '0 0 32px 32px'
}))

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: GREEN_COLOR,
  fontWeight: 600,
  fontSize: '1rem',
  borderRadius: theme.shape.borderRadius * 1.5,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
    '& .arrow-icon': {
      transform: 'translateX(3px)'
    }
  },
  padding: theme.spacing(1.2, 4),
  [theme.breakpoints.down('md')]: {
    fontSize: '0.9rem'
  },
  '& .MuiButton-endIcon': {
    marginLeft: theme.spacing(1)
  },
  '& .arrow-icon': {
    transition: 'transform 0.2s ease-in-out'
  }
}))

export default function HomeFiatTransfer() {
  const { t } = useTranslate()
  const [currentCurrencyIndex, setCurrentCurrencyIndex] = useState(0)
  const currencies = t('home.fiat-transfer.currencies', { returnObjects: true }) as string[]

  const whatsappMessage = encodeURIComponent(t('home.fiat-transfer.whatsapp_msg'))
  const whatsappLink = `https://wa.me/?text=${whatsappMessage}`

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCurrencyIndex((prevIndex) => (prevIndex + 1) % currencies.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [currencies.length])

  // Get the title with the currency marker
  const titleWithMarker = t('home.fiat-transfer.title')

  return (
    <StyledRoot>
      <Container
        sx={{
          position: 'relative',
          px: { xs: 2, md: 0 },
          width: '100%',
          maxWidth: { lg: '100%' }
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
              py: 15,
              px: 10
            }}
          >
            <m.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              viewport={{ once: false, margin: '-100px' }}
            >
              <Typography
                variant='h3'
                sx={{
                  mb: 3,
                  color: 'common.white',
                  fontWeight: 700,
                  position: 'relative',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  textAlign: { xs: 'center', md: 'left' },
                  gap: 0.5
                }}
              >
                <Box component='span'>{titleWithMarker.split('#currency#')[0]}</Box>
                <Box
                  component='span'
                  sx={{
                    display: 'inline-flex',
                    position: 'relative',
                    height: '1.5em',
                    padding: 0,
                    margin: 0,
                    justifyContent: 'center'
                  }}
                >
                  <AnimatePresence mode='wait' initial={false}>
                    <m.span
                      key={currentCurrencyIndex}
                      initial={{
                        opacity: 0,
                        y: 10,
                        filter: 'blur(3px)'
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        filter: 'blur(0px)',
                        transition: {
                          type: 'spring',
                          stiffness: 300,
                          damping: 20
                        }
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                        filter: 'blur(3px)',
                        transition: {
                          duration: 0.2
                        }
                      }}
                      style={{
                        display: 'inline',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        color: '#ffffff',
                        textShadow: '0 0 8px rgba(0,0,0,0.15)'
                      }}
                    >
                      {currencies[currentCurrencyIndex]}
                    </m.span>
                  </AnimatePresence>
                </Box>
                <Box component='span'>{titleWithMarker.split('#currency#')[1]}</Box>
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
                {t('home.fiat-transfer.description')}
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
                <a
                  href={whatsappLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ textDecoration: 'none' }}
                >
                  <StyledButton
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
                  >
                    {t('home.fiat-transfer.button')}
                  </StyledButton>
                </a>
              </m.div>
            </Box>
          </Grid>

          <Box
            sx={{
              position: 'relative',
              left: 'auto',
              height: '100%',
              width: '50%',
              display: { xs: 'none', md: 'block' },
              overflow: 'hidden'
            }}
          >
            <m.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              viewport={{ once: false, margin: '-100px' }}
              style={{ height: '100%' }}
            >
              <Box
                component='img'
                src='/assets/images/home/fiat_like_pro.png'
                alt='Fiat transfer'
                sx={{
                  height: '100%',
                  maxWidth: 'none',
                  objectFit: 'cover',
                  objectPosition: 'center right'
                }}
              />
            </m.div>
          </Box>
        </Grid>
      </Container>
    </StyledRoot>
  )
}
