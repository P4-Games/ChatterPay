import { m } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import { useResponsive } from 'src/hooks/use-responsive'

import { useTranslate } from 'src/locales'

import { MotionViewport } from 'src/components/animate'
import { SingleWordHighlight } from 'src/components/highlight'

// ----------------------------------------------------------------------

// Constants
const IMG_BASE_URL = '/assets/images/home'

// Theme colors
const COLORS = {
  light: {
    green: '#f0f7ed',
    section: 'transparent',
    border: '#F4F6F8'
  },
  dark: {
    green: '#1e4434',
    background: '#161C24',
    card: '#212B36'
  }
}

// Font size approximations
const CHAR_WIDTH = {
  desktop: 24,
  mobile: 20
}

// Card image sizes for responsive display
const CARD_SIZES = {
  mobile: 80,
  desktop: {
    halfWidth: 100,
    fullWidth: 150
  }
}

// Card configuration
const CARD_CONFIG = [
  {
    icon: `${IMG_BASE_URL}/send.webp`,
    bgColor: COLORS.light.green,
    darkModeBgColor: COLORS.dark.card
  },
  {
    icon: `${IMG_BASE_URL}/coin.webp`,
    bgColor: COLORS.dark.green,
    darkModeBgColor: COLORS.dark.green
  },
  {
    icon: `${IMG_BASE_URL}/certificate.webp`,
    bgColor: COLORS.light.green,
    darkModeBgColor: COLORS.dark.card
  }
]

// Animation variants
const ANIMATIONS = {
  // Container animation with sequential children reveal
  containerDown: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 }
    }
  },

  // Container animation with reversed sequential children reveal
  containerUp: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
        staggerDirection: -1
      }
    }
  },

  // Individual card animation
  card: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    }
  },

  // Title animation
  title: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }
}

export default function HomeMainFeatures() {
  const { t } = useTranslate()
  const theme = useTheme()
  const mdUp = useResponsive('up', 'md')
  const isDarkMode = theme.palette.mode === 'dark'

  // Refs and state
  const titleRef = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [lastWordWidth, setLastWordWidth] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down')
  const [lastScrollY, setLastScrollY] = useState(0)

  // Parse and prepare data
  const titleText = t('home.main-features.title1')
  const lastWord = titleText.trim().split(' ').pop() || ''

  const cards = CARD_CONFIG.map((config, index) => ({
    ...config,
    title: t(`home.main-features.card-${index + 1}.title`),
    description: t(`home.main-features.card-${index + 1}.description`)
  }))

  // Define card type based on the actual structure
  type CardType = (typeof cards)[0]

  // Calculate last word width for highlight positioning
  useEffect(() => {
    if (titleRef.current) {
      const charWidth = mdUp ? CHAR_WIDTH.desktop : CHAR_WIDTH.mobile
      const estimatedWidth = lastWord.length * charWidth
      setLastWordWidth(estimatedWidth)
    }
  }, [lastWord, mdUp])

  // Handle scroll direction detection
  useEffect(() => {
    let isScrolling = false;
    
    const handleScroll = () => {
      // Skip if already processing a scroll event
      if (isScrolling) return;
      
      // Set flag to avoid multiple rapid updates
      isScrolling = true;
      
      // Use requestAnimationFrame for smoother updates
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDifference = Math.abs(currentScrollY - lastScrollY);

        // Only update if scroll difference is significant and in viewport
        if (scrollDifference > 20 && containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

          // Change direction only when component is in viewport
          if (isInViewport) {
            setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
          }

          setLastScrollY(currentScrollY);
        }
        
        // Reset flag
        isScrolling = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Render a feature card
  const renderCard = (card: CardType, index: number) => {
    const isFullWidth = index === 0 || index === 3
    const cardBgColor = isDarkMode ? card.darkModeBgColor : card.bgColor
    const isGreenCard = cardBgColor === COLORS.dark.green
    const imageSize = isFullWidth ? CARD_SIZES.desktop.fullWidth : CARD_SIZES.desktop.halfWidth

    // Determine text colors based on card type and theme
    const titleColor = isGreenCard || isDarkMode ? 'common.white' : 'text.primary'
    const textColor = isGreenCard || isDarkMode ? 'common.white' : 'text.primary'
    const descColor = isGreenCard ? 'common.white' : 'text.secondary'

    return (
      <Card
        sx={{
          textAlign: isFullWidth ? { xs: 'center', md: 'left' } : 'center',
          bgcolor: cardBgColor,
          p: (th) => th.spacing(5, 6),
          color: textColor,
          height: '100%',
          display: 'flex',
          flexDirection: {
            xs: 'column',
            md: isFullWidth ? 'row' : 'column'
          },
          alignItems: {
            xs: 'center',
            md: isFullWidth ? 'center' : 'center'
          },
          borderRadius: 2,
          position: 'relative'
        }}
      >
        {/* Card content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: isFullWidth ? { md: 1 } : 'unset',
            alignItems: isFullWidth ? { xs: 'center', md: 'flex-start' } : 'center',
            mr: isFullWidth ? { md: 16 } : 0,
            maxWidth: isFullWidth ? { md: '60%' } : 'unset',
            zIndex: 1
          }}
        >
          <Typography variant='h5' sx={{ mb: 2, color: titleColor, fontWeight: 'bold' }}>
            {card.title}
          </Typography>

          <Typography
            sx={{
              color: descColor,
              fontSize: { xs: '0.875rem', md: '1rem' },
              flexGrow: 1
            }}
          >
            {card.description}
          </Typography>
        </Box>

        {/* Card image */}
        <Box
          sx={{
            order: { xs: -1, md: isFullWidth ? 1 : -1 },
            mb: { xs: 3, md: isFullWidth ? 0 : 3 },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            ...(isFullWidth && {
              position: { md: 'absolute' },
              right: { md: 30 },
              top: { md: '50%' },
              transform: { md: 'translateY(-50%)' }
            })
          }}
        >
          <Box
            component='img'
            src={card.icon}
            alt={card.title}
            sx={{
              width: { xs: CARD_SIZES.mobile, md: imageSize },
              height: { xs: CARD_SIZES.mobile, md: imageSize },
              objectFit: 'contain'
            }}
          />
        </Box>
      </Card>
    )
  }

  return (
    <Box
      sx={{
        backgroundColor: isDarkMode ? COLORS.dark.background : 'transparent',
        mb: -12
      }}
    >
      <Container component={MotionViewport} sx={{ py: { xs: 10, md: 15 } }}>
        {/* Section title with underline highlight */}
        <Stack
          spacing={3}
          sx={{
            textAlign: 'center',
            mb: { xs: 5, md: 10 }
          }}
        >
          <m.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-5% 0px', amount: 0.3 }}
            variants={ANIMATIONS.title}
          >
            <Typography variant='h2' sx={{ color: isDarkMode ? 'common.white' : 'text.primary' }}>
              <Box component='span' ref={titleRef}>
                {titleText}
              </Box>
              <Box
                component='span'
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -40,
                    left: lastWordWidth > 0 ? `-${lastWordWidth}px` : 0,
                    zIndex: 1
                  }}
                >
                  <SingleWordHighlight size='lg' width={lastWordWidth} />
                </Box>
              </Box>
            </Typography>
          </m.div>
        </Stack>

        {/* Feature cards grid */}
        <m.div
          ref={containerRef}
          variants={scrollDirection === 'down' ? ANIMATIONS.containerDown : ANIMATIONS.containerUp}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: false, amount: 0.2 }}
        >
          <Box
            gap={{ xs: 3, lg: 7 }}
            display='grid'
            sx={{
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)'
              },
              gridTemplateRows: 'auto',
              '& > *:nth-of-type(1)': { gridColumn: { xs: '1', md: '1 / span 2' } },
              '& > *:nth-of-type(2)': { gridColumn: { xs: '1', md: '1' } },
              '& > *:nth-of-type(3)': { gridColumn: { xs: '1', md: '2' } },
              '& > *:nth-of-type(4)': { gridColumn: { xs: '1', md: '1 / span 2' } }
            }}
          >
            {cards.map((card, index) => (
              <m.div key={card.title} variants={ANIMATIONS.card}>
                {renderCard(card, index)}
              </m.div>
            ))}
          </Box>
        </m.div>
      </Container>

      {/* Curved bottom border */}
      <Box
        sx={{
          height: 64,
          width: '100%',
          backgroundColor: COLORS.light.border,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          bottom: 60,
          position: 'relative',
          zIndex: 10,
          ...(isDarkMode && {
            backgroundColor: COLORS.dark.background
          })
        }}
      />
    </Box>
  )
}
