import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import { Button } from '@mui/material'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { paths } from 'src/routes/paths'

import { useResponsive } from 'src/hooks/use-responsive'

import { bgGradient, textGradient } from 'src/theme/css'

import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeForDesigner() {
  const theme = useTheme()

  const mdUp = useResponsive('up', 'md')

  const viewAllBtn = (
    <m.div variants={varFade().inUp}>
      <Button
        size='large'
        color='inherit'
        variant='contained'
        target='_blank'
        rel='noopener'
        href={paths.contactus}
      >
        Contact Us
      </Button>
    </m.div>
  )

  const renderDescription = (
    <Box sx={{ textAlign: { xs: 'center', md: 'unset' }, mt: { xs: 10, md: 20 } }}>
      <m.div variants={varFade().inUp}>
        <Typography component='div' variant='overline' sx={{ color: 'text.disabled' }}>
          Test It
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography
          variant='h2'
          sx={{
            mt: 3,
            mb: 5,
            ...textGradient(
              `300deg, ${theme.palette.primary.main} 0%, ${theme.palette.warning.main} 100%`
            )
          }}
        >
          Request a Demo
        </Typography>
        <m.div variants={varFade().inUp}>
          <Typography
            sx={{
              mb: 5,
              color: 'text.secondary'
            }}
          >
            Contact our team for a product demo. <br />
            It&apos;s the wallet you need to enter the Web3 world.
          </Typography>
        </m.div>
      </m.div>
    </Box>
  )

  const renderImg = (
    <Box
      component={m.img}
      src='/assets/images/home/for_designer.webp'
      variants={varFade().in}
      sx={{
        height: 1,
        width: 0.5,
        objectFit: 'cover',
        position: 'absolute',
        boxShadow: `-80px 80px 80px ${
          theme.palette.mode === 'light'
            ? alpha(theme.palette.grey[500], 0.48)
            : alpha(theme.palette.common.black, 0.24)
        }`
      }}
    />
  )

  return (
    <Box
      sx={{
        minHeight: 560,
        overflow: 'hidden',
        position: 'relative',
        ...bgGradient({
          startColor: `${theme.palette.grey[900]} 25%`,
          endColor: alpha(theme.palette.grey[900], 0),
          imgUrl: '/assets/images/home/for_designer.webp'
        }),
        ...(mdUp && {
          ...bgGradient({
            color: alpha(theme.palette.background.default, 0.8),
            imgUrl: '/assets/background/overlay_4.jpg'
          })
        })
      }}
    >
      <Container component={MotionViewport}>
        <Grid container>
          <Grid xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            {renderDescription}
            {viewAllBtn}
          </Grid>

          {mdUp && <Grid md={6}>{renderImg}</Grid>}
        </Grid>
      </Container>
    </Box>
  )
}
