import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import { Button, styled } from '@mui/material'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useResponsive } from 'src/hooks/use-responsive'

import { useTranslate } from 'src/locales'
import { bgGradient, textGradient } from 'src/theme/css'

import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

const usePolygons = false

type StyledPolygonProps = {
  anchor?: 'top' | 'bottom'
}

const StyledPolygon = styled('div')<StyledPolygonProps>(({ anchor = 'top', theme }) => ({
  left: 0,
  zIndex: 999,
  height: 80,
  width: '100%',
  position: 'absolute',
  clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)',
  backgroundColor: theme.palette.background.neutral,
  display: 'block',
  lineHeight: 0,
  ...(anchor === 'top' && {
    top: -1,
    transform: 'scale(-1, -1)',
    // alpha(theme.palette.grey[500], 0.04)
    // backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.default : theme.palette.grey[900]
    backgroundColor:
      theme.palette.mode === 'light'
        ? alpha(theme.palette.grey[100], 1)
        : alpha(theme.palette.grey[900], 0.04)
  }),
  ...(anchor === 'bottom' && {
    bottom: -1,
    // alpha(theme.palette.grey[500], 0.04)
    backgroundColor:
      theme.palette.mode === 'light'
        ? alpha(theme.palette.grey[100], 1)
        : alpha(theme.palette.grey[900], 0.04)
  })
}))

export default function HomeRequestDemo() {
  const theme = useTheme()
  const mdUp = useResponsive('up', 'md')
  const { t } = useTranslate()

  const contactUsBtn = (
    <m.div variants={varFade().inUp}>
      <Button
        size='large'
        color='inherit'
        variant='contained'
        target='_blank'
        rel='noopener'
        href='#'
      >
        {t('home.common.contact-us')}
      </Button>
    </m.div>
  )

  const renderDescription = (
    <Box sx={{ textAlign: { xs: 'center', md: 'unset' }, mt: { xs: 10, md: 15 } }}>
      <m.div variants={varFade().inUp}>
        <Typography component='div' variant='overline' sx={{ color: 'text.disabled' }}>
          {t('home.request-demo.tag')}
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
          {t('home.request-demo.title')}
        </Typography>

        <m.div variants={varFade().inUp}>
          <Typography
            sx={{
              mb: 10,
              color: theme.palette.grey[400]
            }}
          >
            {t('home.request-demo.description1')} <br />
            {t('home.request-demo.description2')}
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
    <Box sx={{ position: 'relative' }}>
      {usePolygons && <StyledPolygon anchor='top' />}
      <Box
        sx={{
          minHeight: 600,
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
              imgUrl: '/assets/images/background/overlay_4.jpg'
            })
          })
        }}
      >
        <Container component={MotionViewport}>
          <Grid container>
            <Grid xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {renderDescription}
              {contactUsBtn}
            </Grid>

            {mdUp && <Grid md={6}>{renderImg}</Grid>}
          </Grid>
        </Container>
      </Box>

      {usePolygons && <StyledPolygon anchor='bottom' />}
    </Box>
  )
}
