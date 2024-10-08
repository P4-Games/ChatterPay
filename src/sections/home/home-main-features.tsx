import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { useResponsive } from 'src/hooks/use-responsive'

import { useTranslate } from 'src/locales'

import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeMainFeatures() {
  const { t } = useTranslate()
  const mdUp = useResponsive('up', 'md')

  const CARDS = [
    {
      icon: ' /assets/icons/home/ic_design.svg',
      title: t('home.main-features.card-1.title'),
      description: t('home.main-features.card-1.description')
    },
    {
      icon: ' /assets/icons/home/ic_chat.svg',
      title: t('home.main-features.card-2.title'),
      description: t('home.main-features.card-2.description')
    },
    {
      icon: ' /assets/icons/home/ic_make_brand.svg',
      title: t('home.main-features.card-3.title'),
      description: t('home.main-features.card-3.description')
    }
  ]

  const renderCardItems = CARDS.map((card, index) => (
    <m.div variants={varFade().inUp} key={card.title}>
      <Card
        sx={{
          textAlign: 'center',
          bgcolor: 'background.default',
          p: (th) => th.spacing(5, 6),

          boxShadow: (th) => ({
            md: `-10px 10px 3px 3px ${
              th.palette.mode === 'light'
                ? alpha(th.palette.grey[900], 0.16)
                : alpha(th.palette.common.black, 0.4)
            }`,
            xs: `-10px 10px 3px 3px ${
              th.palette.mode === 'light'
                ? alpha(th.palette.grey[500], 0.04)
                : alpha(th.palette.common.black, 0.4)
            }`
          })
        }}
      >
        <Box
          component='img'
          src={card.icon}
          alt={card.title}
          sx={{ mx: 'auto', my: 'auto', width: 48, height: 48 }}
        />

        <Typography
          variant='h5'
          sx={{
            minHeight: mdUp ? '6rem' : '2rem',
            mt: 4,
            mb: 2
          }}
        >
          {card.title}
        </Typography>

        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: mdUp ? '0.875rem' : '1.1rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            minHeight: mdUp ? '9rem' : '2rem'
          }}
        >
          {card.description}
        </Typography>
      </Card>
    </m.div>
  ))

  return (
    <Box
      sx={{
        py: { xs: 5, md: 5 }
      }}
    >
      <Container
        component={MotionViewport}
        sx={{
          py: { xs: 10, md: 15 }
        }}
      >
        <Stack
          spacing={3}
          sx={{
            textAlign: 'center',
            mb: { xs: 5, md: 10 }
          }}
        >
          <m.div variants={varFade().inUp}>
            <Typography component='div' variant='overline' sx={{ color: 'text.disabled' }}>
              {t('home.main-features.tag')}
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography variant='h2'>
              {t('home.main-features.title1')} <br /> {t('home.main-features.title2')}
            </Typography>
          </m.div>
        </Stack>

        <Box
          gap={{ xs: 3, lg: 7 }}
          display='grid'
          gridTemplateColumns={{
            xs: '1fr',
            sm: '1fr',
            md: 'repeat(3, 1fr)'
          }}
        >
          {renderCardItems}
        </Box>
      </Container>
    </Box>
  )
}
