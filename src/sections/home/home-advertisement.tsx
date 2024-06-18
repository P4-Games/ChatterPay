import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Container from '@mui/material/Container'

import { bgGradient } from 'src/theme/css'

import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeAdvertisement() {
  const theme = useTheme()

  const renderDescription = (
    <Box
      sx={{
        textAlign: {
          xs: 'center',
          md: 'left'
        }
      }}
    >
      <Box
        component={m.div}
        variants={varFade().inDown}
        sx={{ color: 'common.white', mb: 5, typography: 'h2' }}
      >
        Get started with
        <br /> ChatterPay
      </Box>

      <m.div variants={varFade().inDown}>
        <Typography sx={{ color: 'grey.500' }}>
          All the power of Web3 with none of the hassle.
        </Typography>
      </m.div>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent={{ xs: 'center', md: 'flex-start' }}
        spacing={2}
      />
    </Box>
  )

  const renderImg = (
    <Stack component={m.div} variants={varFade().inUp} alignItems='center'>
      <Box
        component={m.img}
        animate={{
          y: [-20, 0, -20]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        alt='rocket'
        src='/assets/images/home/rocket.webp'
        sx={{ maxWidth: 460 }}
      />
    </Stack>
  )

  return (
    <Container component={MotionViewport}>
      <Stack
        alignItems='center'
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          ...bgGradient({
            direction: '135deg',
            startColor: theme.palette.primary.main,
            endColor: theme.palette.primary.dark
          }),
          borderRadius: 2,
          pb: { xs: 5, md: 0 }
        }}
      >
        {renderImg}

        {renderDescription}
      </Stack>
    </Container>
  )
}
