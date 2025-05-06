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

import { SingleWordHighlight } from 'src/components/highlight'
import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

// Card colors
const LIGHT_GREEN = '#f0f7ed'
const DARK_GREEN = '#1e4434'
const DARK_MODE_BG = '#161C24'
const DARK_MODE_CARD_LIGHT = '#212B36'

// Font size approximation
const CHARACTER_WIDTH_DESKTOP = 24
const CHARACTER_WIDTH_MOBILE = 20

// Card image sizes
const CARD_IMAGE_SIZE = {
  mobile: 80,
  desktop: {
    halfWidth: 100,
    fullWidth: 150
  }
}

const IMG_BASE_URL = '/assets/images/home'

// Fixed card data without translations
const CARD_CONFIG = [
  {
    icon: `${IMG_BASE_URL}/send.webp`,
    bgColor: LIGHT_GREEN,
    darkModeBgColor: DARK_MODE_CARD_LIGHT
  },
  {
    icon: `${IMG_BASE_URL}/coin.webp`,
    bgColor: DARK_GREEN,
    darkModeBgColor: DARK_GREEN
  },
  {
    icon: `${IMG_BASE_URL}/certificate.webp`,
    bgColor: LIGHT_GREEN,
    darkModeBgColor: DARK_MODE_CARD_LIGHT
  },
  {
    icon: `${IMG_BASE_URL}/low_fees.webp`,
    bgColor: LIGHT_GREEN,
    darkModeBgColor: DARK_MODE_CARD_LIGHT
  }
]

export default function HomeMainFeatures() {
  const { t } = useTranslate()
  const theme = useTheme()
  const mdUp = useResponsive('up', 'md')
  const [lastWordWidth, setLastWordWidth] = useState(0)
  const titleRef = useRef<HTMLSpanElement>(null)

  const isDarkMode = theme.palette.mode === 'dark'

  // Extract the last word from the title text
  const titleText = t('home.main-features.title1')
  const lastWord = titleText.trim().split(' ').pop() || ''

  useEffect(() => {
    if (titleRef.current) {
      // Calculate approximate width based on character count and font size
      const charWidth = mdUp ? CHARACTER_WIDTH_DESKTOP : CHARACTER_WIDTH_MOBILE
      const estimatedWidth = lastWord.length * charWidth
      setLastWordWidth(estimatedWidth)
    }
  }, [lastWord, mdUp])

  // Feature cards configuration with content and styling
  const CARDS = CARD_CONFIG.map((config, index) => ({
    ...config,
    title: t(`home.main-features.card-${index + 1}.title`),
    description: t(`home.main-features.card-${index + 1}.description`)
  }))

  // Render individual feature card
  const renderCard = (card: typeof CARDS[0], index: number) => {
    // Determine if card is full width in desktop (first and fourth cards)
    const isFullWidthDesktop = index === 0 || index === 3;
    const cardBgColor = isDarkMode ? card.darkModeBgColor : card.bgColor;
    const isGreenCard = cardBgColor === DARK_GREEN;
    const imageSize = isFullWidthDesktop 
      ? CARD_IMAGE_SIZE.desktop.fullWidth 
      : CARD_IMAGE_SIZE.desktop.halfWidth;
    
    // Determine text colors based on card type and theme
    let titleColor = 'text.primary';
    let cardTextColor = 'text.primary';
    const descriptionColor = isGreenCard ? 'common.white' : 'text.secondary';
    
    // Override colors for green cards and dark mode
    if (isGreenCard) {
      titleColor = 'common.white';
      cardTextColor = 'common.white';
    } else if (isDarkMode) {
      titleColor = 'common.white';
      cardTextColor = 'common.white';
    }
    
    return (
      <Card
        sx={{
          textAlign: isFullWidthDesktop ? { xs: 'center', md: 'left' } : 'center',
          bgcolor: cardBgColor,
          p: (th) => th.spacing(5, 6),
          color: cardTextColor,
          height: '100%',
          display: 'flex',
          flexDirection: { 
            xs: 'column', 
            md: isFullWidthDesktop ? 'row' : 'column' 
          },
          alignItems: { 
            xs: 'center', 
            md: isFullWidthDesktop ? 'center' : 'center' 
          },
          borderRadius: 2,
          position: 'relative'
        }}
      >
        {/* Content section (left side for full width in desktop) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: isFullWidthDesktop ? { md: 1 } : 'unset',
            alignItems: isFullWidthDesktop 
              ? { xs: 'center', md: 'flex-start' } 
              : 'center',
            mr: isFullWidthDesktop ? { md: 16 } : 0,
            maxWidth: isFullWidthDesktop ? { md: '60%' } : 'unset',
            zIndex: 1
          }}
        >
          <Typography
            variant='h5'
            sx={{
              mb: 2,
              color: titleColor,
              fontWeight: 'bold'
            }}
          >
            {card.title}
          </Typography>

          <Typography
            sx={{
              color: descriptionColor,
              fontSize: { xs: '0.875rem', md: '1rem' },
              flexGrow: 1
            }}
          >
            {card.description}
          </Typography>
        </Box>

        {/* Image section (right side for full width in desktop) */}
        <Box
          sx={{ 
            order: { 
              xs: -1, 
              md: isFullWidthDesktop ? 1 : -1 
            },
            mb: { 
              xs: 3, 
              md: isFullWidthDesktop ? 0 : 3 
            },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            ...(isFullWidthDesktop && {
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
              width: { xs: CARD_IMAGE_SIZE.mobile, md: imageSize }, 
              height: { xs: CARD_IMAGE_SIZE.mobile, md: imageSize },
              objectFit: 'contain'
            }}
          />
        </Box>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        py: { xs: 5, md: 5 },
        backgroundColor: isDarkMode ? DARK_MODE_BG : 'transparent'
      }}
    >
      <Container
        component={MotionViewport}
        sx={{
          py: { xs: 10, md: 15 }
        }}
      >
        {/* Section title with underline highlight */}
        <Stack
          spacing={3}
          sx={{
            textAlign: 'center',
            mb: { xs: 5, md: 10 }
          }}
        >
          <m.div variants={varFade().inDown}>
            <Typography 
              variant='h2' 
              sx={{ color: isDarkMode ? 'common.white' : 'text.primary' }}
            >
              <Box component="span" ref={titleRef}>
                {t('home.main-features.title1')}
              </Box>
              <Box
                component="span"
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -40,
                    left: lastWordWidth > 0 ? `-${lastWordWidth}px` : 0,
                    zIndex: 1,
                  }}
                >
                  <SingleWordHighlight size="lg" width={lastWordWidth} />
                </Box>
              </Box>
            </Typography>
          </m.div>
        </Stack>

        {/* Grid layout for cards with custom layout for desktop and mobile */}
        <Box
          gap={{ xs: 3, lg: 7 }}
          display="grid"
          sx={{
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)'
            },
            gridTemplateRows: 'auto',
            '& > *:nth-of-type(1)': {
              gridColumn: {
                xs: '1',
                md: '1 / span 2'
              }
            },
            '& > *:nth-of-type(2)': {
              gridColumn: {
                xs: '1',
                md: '1'
              }
            },
            '& > *:nth-of-type(3)': {
              gridColumn: {
                xs: '1',
                md: '2'
              }
            },
            '& > *:nth-of-type(4)': {
              gridColumn: {
                xs: '1',
                md: '1 / span 2'
              }
            }
          }}
        >
          {CARDS.map((card, index) => (
            <m.div key={card.title} variants={varFade().inUp}>
              {renderCard(card, index)}
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  )
}
