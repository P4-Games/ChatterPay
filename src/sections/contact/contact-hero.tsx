import { m, MotionProps } from 'framer-motion'

import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Box, { BoxProps } from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { bgGradient } from 'src/theme/css'

import { varFade, MotionContainer } from 'src/components/animate'

// ----------------------------------------------------------------------

const CONTACTS = [
  {
    country: 'Bali',
    address: '508 Bridle Avenue Newnan, GA 30263',
    phoneNumber: '(239) 555-0108'
  },
  {
    country: 'London',
    address: '508 Bridle Avenue Newnan, GA 30263',
    phoneNumber: '(319) 555-0115'
  },
  {
    country: 'Prague',
    address: '508 Bridle Avenue Newnan, GA 30263',
    phoneNumber: '(252) 555-0126'
  },
  {
    country: 'Moscow',
    address: '508 Bridle',
    phoneNumber: '(307) 555-0133'
  }
]

// ----------------------------------------------------------------------

export default function ContactHero() {
  const theme = useTheme()

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.grey[900], 0.8),
          imgUrl: '/assets/images/contact/hero.jpg'
        }),
        height: { md: 560 },
        py: { xs: 10, md: 0 },
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Container component={MotionContainer}>
        <Box
          sx={{
            bottom: { md: 80 },
            position: { md: 'absolute' },
            textAlign: { xs: 'center', md: 'unset' }
          }}
        >
          <TextAnimate text='Where' sx={{ color: 'primary.main' }} variants={varFade().inRight} />
          <br />

          <Stack spacing={2} display='inline-flex' direction='row' sx={{ color: 'common.white' }}>
            <TextAnimate text='to' />
            <TextAnimate text='find' />
            <TextAnimate text='us?' />
          </Stack>

          <Stack
            spacing={5}
            alignItems={{ xs: 'center', md: 'unset' }}
            direction={{ xs: 'column', md: 'row' }}
            sx={{ mt: 5, color: 'common.white' }}
          >
            {CONTACTS.map((contact) => (
              <Stack key={contact.country} sx={{ maxWidth: 180 }}>
                <m.div variants={varFade().in}>
                  <Typography variant='h6' gutterBottom>
                    {contact.country}
                  </Typography>
                </m.div>

                <m.div variants={varFade().inRight}>
                  <Typography variant='body2' sx={{ opacity: 0.8 }}>
                    {contact.address}
                  </Typography>
                </m.div>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}

// ----------------------------------------------------------------------

type TextAnimateProps = BoxProps &
  MotionProps & {
    text: string
  }

function TextAnimate({ text, variants, sx, ...other }: TextAnimateProps) {
  return (
    <Box
      component={m.div}
      sx={{
        typography: 'h1',
        overflow: 'hidden',
        display: 'inline-flex',
        ...sx
      }}
      {...other}
    >
      {text.split('').map((letter, index) => (
        <m.span key={index} variants={variants || varFade().inUp}>
          {letter}
        </m.span>
      ))}
    </Box>
  )
}
