import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useResponsive } from 'src/hooks/use-responsive'

import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

const CARDS = [
  {
    icon_light: '/assets/icons/home/ic_ethereum.svg',
    icon_dark: '/assets/icons/home/ic_ethereum.svg',
    title: 'Ethereum',
    description:
      'Layer 1 Blockchain for smart contracts and decentralized applications. Ensures security for transactions.'
  },
  {
    icon_light: '/assets/icons/home/ic_scroll.svg',
    icon_dark: '/assets/icons/home/ic_scroll.svg',
    title: 'Scroll',
    description:
      'Layer 2 blockchain solution for Ethereum, offering faster and cheaper transactions. Designed to improve efficiency and usability.'
  },
  {
    icon_light: '/assets/icons/home/ic_whatsapp.svg',
    icon_dark: '/assets/icons/home/ic_whatsapp.svg',
    title: 'WhatsApp',
    description:
      'Global messaging platform for communication. Provides secure messaging and easy integration with other services.'
  },
  {
    icon_light: '/assets/icons/home/ic_openia_light.svg',
    icon_dark: '/assets/icons/home/ic_openia_dark.svg',
    title: 'OpenAI',
    description:
      'AI platform that understands and generates human-like text. Powers advanced language processing and learning capabilities.'
  },
  {
    icon_light: '/assets/icons/home/ic_the_graph.png',
    icon_dark: '/assets/icons/home/ic_the_graph.png',
    title: 'The Graph',
    description:
      'Protocol for easily finding and accessing blockchain data. Simplifies data access for developers and users alike.'
  },
  {
    icon_light: '/assets/icons/home/ic_account_abstraction.svg',
    icon_dark: '/assets/icons/home/ic_account_abstraction.svg',
    title: 'Account Abstraction',
    description:
      'Concept allowing interaction with blockchains without needing specific cryptocurrencies. Enhances flexibility and usability for users.'
  }
]

// ----------------------------------------------------------------------

export default function HomeStackTech() {
  const theme = useTheme()
  const mdUp = useResponsive('up', 'md')

  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
        bgcolor: (t) => alpha(t.palette.grey[500], 0.04)
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
            mb: { xs: 2, md: 5 }
          }}
        >
          <m.div variants={varFade().inUp}>
            <Typography component='div' variant='overline' sx={{ color: 'text.disabled' }}>
              Tech
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography variant='h2'>Technologies We Rely On</Typography>
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
          {CARDS.map((card, index) => (
            <m.div variants={varFade().inUp} key={card.title}>
              <Card
                sx={{
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  p: (t) => t.spacing(5),
                  boxShadow: (t) => ({
                    md: `-10px 10px 3px 3px ${
                      t.palette.mode === 'light'
                        ? alpha(t.palette.grey[900], 0.16)
                        : alpha(t.palette.common.black, 0.4)
                    }`,
                    xs: `-10px 10px 3px 3px ${
                      t.palette.mode === 'light'
                        ? alpha(theme.palette.grey[500], 0.04)
                        : alpha(t.palette.common.black, 0.4)
                    }`
                  })
                }}
              >
                <Box
                  component='img'
                  src={theme.palette.mode === 'light' ? card.icon_light : card.icon_dark}
                  alt={card.title}
                  sx={{ mx: 'auto', width: 48, height: 48 }}
                />

                <Typography variant='h6' sx={{ mt: 1, mb: 1 }}>
                  {card.title}
                </Typography>

                <Typography variant={mdUp ? 'caption' : 'body2'} sx={{ color: 'text.secondary' }}>
                  {card.description}
                </Typography>
              </Card>
            </m.div>
          ))}
        </Box>
      </Container>
    </Box>
  )
}
