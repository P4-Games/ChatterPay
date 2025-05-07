import { useRef } from 'react'
import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'

import { useResponsive } from 'src/hooks/use-responsive'

import { useTranslate } from 'src/locales'

import { SingleWordHighlight } from 'src/components/highlight'
import { varFade, MotionContainer } from 'src/components/animate'

// ----------------------------------------------------------------------

const GREEN_COLOR = 'hsla(147, 41%, 21%, 1)'
const BG_COLOR = '#f5f7f6'

const StyledRoot = styled('div')(({ theme }) => ({
  width: '100%',
  position: 'relative',
  backgroundColor: BG_COLOR,
  [theme.breakpoints.up('md')]: {
    top: 0,
    left: 0,
    height: '100vh',
  },
}))

const StyledImagePlaceholder = styled(Box)(({ theme }) => ({
  width: 318,
  height: 637,
  borderRadius: theme.shape.borderRadius * 3,
  overflow: 'hidden',
  position: 'relative',
    background: 'transparent',
  [theme.breakpoints.down('md')]: {
    width: 270,
    height: 540,
    margin: '0 auto',
  }
}))

const StyledIcon = styled('img')(({ theme }) => ({
  position: 'absolute',
  zIndex: 1,
  opacity: 0.5
}))

// For mobile icons - higher visibility
const StyledMobileIcon = styled('img')(({ theme }) => ({
  position: 'absolute',
  zIndex: 1,
  opacity: 0.8
}))

const StyledCreateButton = styled(Button)(({ theme }) => ({
  backgroundColor: GREEN_COLOR,
  color: theme.palette.common.white,
  fontWeight: 600,
  fontSize: '1rem',
  borderRadius: theme.shape.borderRadius * 1.5,
  '&:hover': {
    backgroundColor: 'hsla(147, 41%, 16%, 1)',
  },
  padding: theme.spacing(1.5, 5),
  marginTop: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    marginTop: theme.spacing(3),
    fontSize: '0.9rem',
  },
}))

// ----------------------------------------------------------------------

export default function HomeHero() {
  const { t } = useTranslate()

  const mdUp = useResponsive('up', 'md')
  const heroRef = useRef<HTMLDivElement | null>(null)

  // Find the word "WhatsApp" in the title
  const titleWords = t('home.hero.new.title').split(' ')
  const whatsAppIndex = titleWords.findIndex(word => 
    word.toLowerCase().includes('whatsapp')
  )
  
  // Handle title rendering with WhatsApp highlight
  const renderTitle = () => {
    if (whatsAppIndex === -1) {
      return t('home.hero.new.title')
    }
    
    return (
      <>
        {titleWords.slice(0, whatsAppIndex).join(' ')}{' '}
        <Box 
          component="span" 
          sx={{ 
            position: 'relative',
            display: 'inline-block',
            whiteSpace: 'nowrap'
          }}
        >
          {titleWords[whatsAppIndex]}
          <Box
            sx={{
              position: 'absolute',
              bottom: -17,
              left: 0,
              width: '100%',
              zIndex: 0
            }}
          >
            <SingleWordHighlight 
              size="xl" 
              color={GREEN_COLOR} 
              width={mdUp ? titleWords[whatsAppIndex].length * 29 : titleWords[whatsAppIndex].length * 20} 
              strokeWidth={3} 
            />
          </Box>
        </Box>
        {whatsAppIndex < titleWords.length - 1 ? ` ${  titleWords.slice(whatsAppIndex + 1).join(' ')}` : ''}
      </>
    )
  }

  return (
    <StyledRoot ref={heroRef}>
      <Container 
        component={MotionContainer} 
        sx={{ 
          height: mdUp ? '100vh' : 'auto', 
          py: mdUp ? 0 : 6,
          pl: { md: 0 },
          pr: { md: 0 },
        }}
      >
        <Grid 
          container 
          spacing={{ xs: 5, md: 0 }}
          alignItems="center" 
          sx={{ 
            height: mdUp ? 1 : 'auto',
            maxWidth: "100%",
            mx: 'auto',
            mt: { xs: 6, md: 0 }
          }}
        >
          <Grid xs={12} md={5} sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 5, md: 0 } }}>
            <m.div variants={varFade().in}>
              <Typography variant="h1" sx={{ mb: 3, fontSize: { xs: 32, md: 40, lg: 46 }, fontWeight: 'bold' }}>
                {renderTitle()}
              </Typography>
            </m.div>

            <m.div variants={varFade().in}>
              <StyledCreateButton
                variant="contained"
              >
                {t('home.hero.new.button')}
              </StyledCreateButton>
            </m.div>
          </Grid>

          {/* For mobile view, display phone with proper icons */}
          {!mdUp && (
            <Grid xs={12} sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <Box sx={{ position: 'relative', width: 280, height: 560 }}>
                {/* Mobile icons - Right side of the mockup */}
                <StyledMobileIcon
                  src="/assets/icons/home/landing_resources/hero_arrow_outbound.svg"
                  alt="arrow outbound"
                  sx={{ position: 'absolute', top: '10%', right: '-20%' }}
                />
                
                <StyledMobileIcon
                  src="/assets/icons/home/landing_resources/hero_arrow_inbound.svg"
                  sx={{ position: 'absolute', top: '35%', right: '-25%' }}
                  alt="arrow inbound"
                />
                <StyledMobileIcon
                  src="/assets/icons/home/landing_resources/hero_note.svg"
                  alt="dollar note"
                  sx={{ position: 'absolute', top: '75%', right: '-22%' }}
                />

                
                {/* Mobile icons - Left side of the mockup */}
                <StyledMobileIcon
                  src="/assets/icons/home/landing_resources/hero_chart.svg"
                  alt="chart"
                  sx={{ position: 'absolute', bottom: '60%', left: '-25%'}}
                />
                <StyledMobileIcon
                  src="/assets/icons/home/landing_resources/hero_swap.svg"
                  alt="swap"
                  sx={{ position: 'absolute', bottom: '30%', left: '-20%'}}
                />

                {/* Mockup */}
                <StyledImagePlaceholder sx={{ width: 280, height: 560 }}>
                  <Box
                    component="img"
                    src="https://tmdm.com.ar/u/public/ezgif-614236e5f91b84.gif"
                    alt="WhatsApp interface showing money transfers"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', scale: 1.2 }}
                  />
                </StyledImagePlaceholder>
              </Box>
            </Grid>
          )}

          {/* Desktop view with icons */}
          {mdUp && (
            <Grid md={7} sx={{ position: 'relative', right: { md: "-100px" } }}>
              <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', maxWidth: 600, ml: 'auto' }}>
                {/* Icons at the right side of the mockup */}
                <StyledIcon
                  src="/assets/icons/home/landing_resources/hero_arrow_outbound.svg"
                  alt="arrow outbound"
                  sx={{ top: '25%', left: '80%' }}
                />
                <StyledIcon
                  src="/assets/icons/home/landing_resources/hero_arrow_inbound.svg"
                  alt="arrow inbound"
                  sx={{ top: '40%', left:'80%' }}
                />
                <StyledIcon
                  src="/assets/icons/home/landing_resources/hero_note.svg"
                  alt="dollar note"
                  sx={{ bottom: '20%', left: '75%' }}
                />

                {/* Icons at the left side of the mockup */}
                <StyledIcon
                  src="/assets/icons/home/landing_resources/hero_chart.svg"
                  alt="chart"
                  sx={{ top: '35%', right: '80%' }}
                />
                <StyledIcon
                  src="/assets/icons/home/landing_resources/hero_swap.svg"
                  alt="swap"
                  sx={{ bottom: '25%', right: '80%' }}
                />

                <Box sx={{ position: 'relative', zIndex: 2 }}>
                  <m.div variants={varFade().in}>
                    <StyledImagePlaceholder>
                      <Box
                        component="img"
                        src="https://tmdm.com.ar/u/public/ezgif-614236e5f91b84.gif"
                        alt="WhatsApp interface showing money transfers"
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', scale: 1.2 }}
                      />
                    </StyledImagePlaceholder>
                  </m.div>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>

        {mdUp && (
          <Box
            component={m.div}
            variants={varFade().in}
            whileInView={{
              opacity: [0.3, 0.7, 0.3],
              transition: {
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
              },
            }}
            sx={{
              position: 'absolute',
              bottom: 24,
              left: 0,
              right: 0,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}
            >
              <Box
                component="img"
                src="/assets/icons/home/landing_resources/scroll.svg"
                alt="scroll"
                sx={{ height: 24, mr: 1 }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Scroll to see more
              </Typography>
            </Box>
          </Box>
        )}
      </Container>
    </StyledRoot>
  )
}
