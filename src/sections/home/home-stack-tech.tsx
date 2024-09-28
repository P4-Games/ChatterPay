import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useResponsive } from 'src/hooks/use-responsive'

import { useTranslate } from 'src/locales'

import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeStackTech() {
  const theme = useTheme()
  const mdUp = useResponsive('up', 'md')
  const { t } = useTranslate()

  const CARDS = [
    {
      icon_light: '/assets/icons/home/ic_ethereum.svg',
      icon_dark: '/assets/icons/home/ic_ethereum.svg',
      title: 'Ethereum',
      description: t('home.tech.cards.ethereum.description')
    },
    {
      icon_light: '/assets/icons/home/ic_scroll.svg',
      icon_dark: '/assets/icons/home/ic_scroll.svg',
      title: 'Scroll',
      description: t('home.tech.cards.scroll.description')
    },
    {
      icon_light: '/assets/icons/home/ic_whatsapp.svg',
      icon_dark: '/assets/icons/home/ic_whatsapp.svg',
      title: 'WhatsApp',
      description: t('home.tech.cards.whatsapp.description')
    },
    {
      icon_light: '/assets/icons/home/ic_openia_light.svg',
      icon_dark: '/assets/icons/home/ic_openia_dark.svg',
      title: 'OpenAI',
      description: t('home.tech.cards.openai.description')
    },
    {
      icon_light: '/assets/icons/home/ic_icp_light.svg',
      icon_dark: '/assets/icons/home/ic_icp_dark.svg',
      title: 'ICP',
      description: t('home.tech.cards.icp.description')
    },
    {
      icon_light: '/assets/icons/home/ic_account_abstraction.svg',
      icon_dark: '/assets/icons/home/ic_account_abstraction.svg',
      title: 'Account Abstraction',
      description: t('home.tech.cards.account-abstraction.description')
    }
  ]

  const renderCardIems = CARDS.map((card) => (
    <m.div variants={varFade().inUp} key={card.title}>
      <Card
        sx={{
          textAlign: 'center',
          bgcolor: 'background.default',
          p: (th) => th.spacing(5),
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
          src={theme.palette.mode === 'light' ? card.icon_light : card.icon_dark}
          alt={card.title}
          sx={{ mx: 'auto', my: 'auto', width: 48, height: 48 }}
        />

        <Typography variant='h6' sx={{ mt: 1, mb: 1, minHeight: mdUp ? '3rem' : '2rem' }}>
          {card.title}
        </Typography>

        <Typography
          variant={mdUp ? 'caption' : undefined}
          sx={{
            ...(mdUp
              ? {}
              : {
                  fontSize: '1.1rem',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  minHeight: mdUp ? '9rem' : '2rem'
                }),
            color: 'text.secondary'
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
        bgcolor: (th) => alpha(th.palette.grey[500], 0.04)
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
              {t('home.tech.tag')}
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography variant='h2'>{t('home.tech.title')}</Typography>
          </m.div>
        </Stack>

        <Box
          gap={3}
          display='grid'
          alignItems='center'
          gridTemplateColumns={{
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          }}
        >
          {renderCardIems}
        </Box>
      </Container>
    </Box>
  )
}
