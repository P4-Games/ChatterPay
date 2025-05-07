import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'
import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

const GREEN_COLOR = 'hsla(147, 41%, 21%, 1)'

const StyledRoot = styled('div')(({ theme }) => ({
  backgroundColor: GREEN_COLOR,
  padding: 30,
  overflow: 'hidden',
  position: 'relative',
}))

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: GREEN_COLOR,
  fontWeight: 600,
  fontSize: '1rem',
  borderRadius: theme.shape.borderRadius * 1.5,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
  padding: theme.spacing(1.2, 4),
  [theme.breakpoints.down('md')]: {
    fontSize: '0.9rem',
  },
}))

export default function HomeCTA() {
  const { t } = useTranslate()

  const handleChatStart = () => {
    window.open('https://wa.me/5491173605583?text=Hi!%20I%20want%20to%20create%20an%20account', '_blank')
  }

  return (
    <StyledRoot>
      <Container 
        component={MotionViewport}
        sx={{ 
          position: 'relative',
          px: { xs: 2, md: 0 },
          width: '100%',
          maxWidth: { lg: '100%'},
        }}
      >
        <Grid 
          container 
          spacing={{ xs: 3, md: 3 }}
          alignItems="center"
          justifyContent="center"
          sx={{ position: 'relative' }}
        >
          <Grid xs={12} md={8} sx={{ 
            textAlign: 'center',
            py: { xs: 6, md: 8 },
            px: { xs: 2, md: 5 }
          }}>
            <m.div variants={varFade().inUp}>
              <Typography
                variant="h3"
                sx={{
                  mb: 3,
                  color: 'common.white',
                  fontWeight: 700,
                }}
              >
                {t('home.cta.title')}
              </Typography>
            </m.div>

            <m.div variants={varFade().inUp}>
              <Typography
                sx={{
                  mb: 4,
                  color: 'common.white',
                  opacity: 0.8,
                }}
              >
                {t('home.cta.description')}
              </Typography>
            </m.div>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 4
              }}
            >
              <m.div variants={varFade().inUp}>
                <StyledButton 
                  variant="contained"
                  endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                  onClick={handleChatStart}
                >
                  {t('home.cta.button')}
                </StyledButton>
              </m.div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </StyledRoot>
  )
} 