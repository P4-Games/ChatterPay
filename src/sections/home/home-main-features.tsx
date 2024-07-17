import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'

import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeMainFeatures() {
  const { t } = useTranslate()

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
          boxShadow: { md: 'none' },
          bgcolor: 'background.default',
          p: (theme) => theme.spacing(10, 5),
          ...(index === 1 && {
            boxShadow: (theme) => ({
              md: `-40px 40px 80px ${
                theme.palette.mode === 'light'
                  ? alpha(theme.palette.grey[500], 0.16)
                  : alpha(theme.palette.common.black, 0.4)
              }`
            })
          }),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box
          component='img'
          src={card.icon}
          alt={card.title}
          sx={{ mb: 1, width: 48, height: 48 }}
        />

        <Typography
          variant='h5'
          sx={{
            mt: 6,
            mb: 3,
            fontSize: {
              md: card.description.length > 120 ? '0.875rem' : '1rem',
              xs: '1.4rem'
            }
          }}
        >
          {card.title}
        </Typography>

        <Box sx={{ flexGrow: 1, maxWidth: '100%' }}>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: {
                md: card.description.length > 120 ? '0.875rem' : '1rem',
                xs: '1.2rem'
              }
            }}
          >
            {card.description}
          </Typography>
        </Box>
      </Card>
    </m.div>
  ))

  return (
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
        gap={{ xs: 3, lg: 10 }}
        display='grid'
        alignItems='center'
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          md: 'repeat(3, 1fr)'
        }}
      >
        {renderCardItems}
      </Box>
    </Container>
  )
}
