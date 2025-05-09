import { m } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

// ----------------------------------------------------------------------

// Animation variants
const ANIMATIONS = {
  // Container animation with sequential children reveal
  container: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 }
    }
  },

  // Individual award animation
  award: {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  },

  // Title animation
  title: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  }
}

export default function HomeAwards() {
  const { t } = useTranslate()
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down')
  const [lastScrollY, setLastScrollY] = useState(0)

  // Estandarizar la altura del contenedor, no de los iconos
  const STANDARD_CONTAINER_HEIGHT = 100
  const STANDARD_CONTAINER_MIN_WIDTH = 180

  const AWARDS = [
    { name: 'Scroll', image: '/assets/images/home/awards/scroll.svg', height: 40 },
    { name: 'Internet Computer', image: '/assets/images/home/awards/icp.png' },
    { name: 'The Graph', image: '/assets/images/home/awards/the_graph.svg', height: 37 },
    { name: 'API3', image: '/assets/images/home/awards/api3.png' },
    { name: 'Level Up', image: '/assets/images/home/awards/levelup.svg', height: 35 },
    { name: 'Push', image: '/assets/images/home/awards/push.png', height: 50 },
    { name: 'Circle', image: '/assets/images/home/awards/circle.png' },
    { name: 'Ethereum Argentina', image: '/assets/images/home/awards/etharg.png' },
    { name: 'Ethereum Uruguay', image: '/assets/images/home/awards/ethuy.png' }
  ]

  // Handle scroll direction detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDifference = Math.abs(currentScrollY - lastScrollY)

      // Only update if scroll difference is significant
      if (scrollDifference > 10 && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0

        // Change direction only when component is in viewport
        if (isInViewport) {
          setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up')
        }

        setLastScrollY(currentScrollY)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Adjust the animation to match scroll direction
  const containerAnimation = {
    ...ANIMATIONS.container,
    visible: {
      ...ANIMATIONS.container.visible,
      transition: {
        ...ANIMATIONS.container.visible.transition,
        staggerDirection: scrollDirection === 'up' ? -1 : 1
      }
    }
  }

  return (
    <Box
      sx={{
        pb: { xs: 8, md: 10 },
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.neutral',
        mb: -12
      }}
    >
      <Container>
        <Stack spacing={3} sx={{ textAlign: 'center', mb: 6 }}>
          <m.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: false, margin: '-100px' }}
            variants={ANIMATIONS.title}
          >
            <Typography variant='h3'>
              {t('home.awards.title', { defaultValue: 'Awarded by the best:' })}
            </Typography>
          </m.div>
        </Stack>

        <m.div
          ref={containerRef}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: false, margin: '-100px' }}
          variants={containerAnimation}
        >
          <Grid
            container
            spacing={{ xs: 3, md: 4 }}
            justifyContent='center'
            alignItems='center'
            sx={{
              position: 'relative',
              right: '-',
              mx: 'auto'
            }}
          >
            {AWARDS.map((award, index) => (
              <Grid
                key={award.name}
                item
                xs={6}
                sm={4}
                md={2.4}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <m.div
                  variants={ANIMATIONS.award}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      minWidth: { xs: 120, sm: STANDARD_CONTAINER_MIN_WIDTH },
                      height: STANDARD_CONTAINER_HEIGHT,
                      mx: 'auto',
                      p: 3,
                      ...(theme.palette.mode === 'dark' && {
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '-10px',
                          left: '-10px',
                          right: '-10px',
                          bottom: '-10px',
                          borderRadius: 2,
                          backgroundColor: alpha('#fff', 0.15),
                          border: `1px solid ${alpha('#9e9e9e', 0.2)}`,
                          zIndex: 0
                        }
                      })
                    }}
                  >
                    <Box
                      component='img'
                      src={award.image}
                      alt={award.name}
                      sx={{
                        width: '100%',
                        maxWidth: { xs: '85%', md: '90%' },
                        height: award?.height ?? 82,
                        objectFit: 'contain',
                        transition: 'opacity 0.3s',
                        '&:hover': { opacity: 1 },
                        display: 'block',
                        margin: 0,
                        filter: theme.palette.mode === 'dark' ? 'brightness(1.8)' : 'none',
                        position: 'relative',
                        zIndex: 1
                      }}
                    />
                  </Box>
                </m.div>
              </Grid>
            ))}
          </Grid>
        </m.div>
      </Container>

      {/* Section end rounded borders */}
      <Box
        sx={{
          height: 64,
          width: '100%',
          backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.background.default : '#F4F6F8',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          bottom: -12,
          position: 'relative',
          zIndex: 10
        }}
      />
    </Box>
  )
}
