import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'
import { CHATIZALO_PHONE_NUMBER } from 'src/config-global'

// ----------------------------------------------------------------------

const GREEN_COLOR = 'hsla(147, 41%, 21%, 1)'

const StyledRoot = styled('div')(({ theme }) => ({
  backgroundColor: GREEN_COLOR,
  padding: 30,
  overflow: 'hidden',
  position: 'relative'
}))

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: GREEN_COLOR,
  fontWeight: 600,
  fontSize: '1rem',
  borderRadius: theme.shape.borderRadius * 1.5,
  '&:hover': {
    backgroundColor: theme.palette.grey[100]
  },
  padding: theme.spacing(1.2, 4),
  [theme.breakpoints.down('md')]: {
    fontSize: '0.9rem'
  }
}))

const VideoWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 0,
  paddingBottom: '56.25%', // 16:9 aspect ratio
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  '& iframe': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 0
  }
}))

// Animation configurations
const ANIMATIONS = {
  video: {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  },
  content: {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  },
  title: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  },
  description: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.1,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  },
  button: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  }
}

export default function HomeCTA() {
  const { t } = useTranslate()

  const handleChatStart = () => {
    const message = encodeURIComponent(
      t('home.cta.whatsapp_message') || 'Hi! I want to create an account'
    )
    window.open(`https://wa.me/${CHATIZALO_PHONE_NUMBER}?text=${message}`, '_blank')
  }

  return (
    <StyledRoot>
      <Container
        sx={{
          position: 'relative',
          px: { xs: 2, md: 0 },
          width: '100%',
          maxWidth: { lg: '100%' },
          py: 12
        }}
      >
        <Grid
          container
          spacing={{ xs: 3, md: 5 }}
          alignItems='center'
          justifyContent='space-between'
          direction={{ xs: 'column', md: 'row' }}
          sx={{ position: 'relative' }}
        >
          <Grid
            xs={12}
            md={6}
            sx={{
              py: { xs: 2, md: 8 },
              px: { xs: 2, md: 5 }
            }}
          >
            <m.div
              initial='hidden'
              whileInView='visible'
              viewport={{ once: false, margin: '-100px' }}
              variants={ANIMATIONS.video}
            >
              <VideoWrapper>
                <iframe
                  src='https://www.youtube.com/embed/d6qzonFP8gc?si=0-uCWfEZbFG7BoqX'
                  title='YouTube video player'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                  referrerPolicy='strict-origin-when-cross-origin'
                  allowFullScreen
                />
              </VideoWrapper>
            </m.div>
          </Grid>

          <Grid
            xs={12}
            md={6}
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              py: { xs: 4, md: 8 },
              px: { xs: 2, md: 5 }
            }}
          >
            <m.div
              initial='hidden'
              whileInView='visible'
              viewport={{ once: false, margin: '-100px' }}
              variants={ANIMATIONS.content}
            >
              <m.div variants={ANIMATIONS.title}>
                <Typography
                  variant='h3'
                  sx={{
                    mb: 3,
                    color: 'common.white',
                    fontWeight: 700
                  }}
                >
                  {t('home.cta.title_new')}
                </Typography>
              </m.div>

              <m.div variants={ANIMATIONS.description}>
                <Typography
                  sx={{
                    mb: 4,
                    color: 'common.white',
                    opacity: 0.8
                  }}
                >
                  {t('home.cta.description')}
                </Typography>
              </m.div>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  mb: 4
                }}
              >
                <m.div variants={ANIMATIONS.button}>
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
                    onClick={handleChatStart}
                  >
                    {t('home.cta.button')}
                  </StyledButton>
                </m.div>
              </Box>
            </m.div>
          </Grid>
        </Grid>
      </Container>
    </StyledRoot>
  )
}
