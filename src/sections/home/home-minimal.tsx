import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

const CARDS = [
  {
    icon: ' /assets/icons/home/ic_design.svg',
    title: 'Make the blockchain complexity invisible',
    description:
      'Hide passphrases, transaction approval pop-ups, and sponsor gas fees for transactions. We handle all the technical stuff for you.'
  },
  {
    icon: ' /assets/icons/home/ic_chat.svg',
    title: 'Transfer money easily',
    description: 'Simply send a text message via WhatsApp to transfer, receive, and store value.'
  },
  {
    icon: ' /assets/icons/home/ic_make_brand.svg',
    title: 'Invoice and notify payments effortlessly',
    description:
      'Request Crypto payments via WhatsApp. Issue dynamic invoices, get paid in various currencies, and receive notifications on completion.'
  }
]

// ----------------------------------------------------------------------

export default function HomeMinimal() {
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
            Main Features
          </Typography>
        </m.div>

        <m.div variants={varFade().inDown}>
          <Typography variant='h2'>
            How can ChatterPay <br /> helps you?
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
        {CARDS.map((card, index) => (
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
                })
              }}
            >
              <Box
                component='img'
                src={card.icon}
                alt={card.title}
                sx={{ mx: 'auto', width: 48, height: 48 }}
              />

              <Typography variant='h5' sx={{ mt: 8, mb: 2 }}>
                {card.title}
              </Typography>

              <Typography sx={{ color: 'text.secondary' }}>{card.description}</Typography>
            </Card>
          </m.div>
        ))}
      </Box>
    </Container>
  )
}
