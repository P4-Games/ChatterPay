import type { ElementType } from 'react'

import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import type { ButtonProps } from '@mui/material/Button'
import { alpha, styled } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'

import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'

import { useTranslate } from 'src/locales'
import {
  buttonSheen,
  buttonEdgeShadow,
  buttonPressedShadow
} from 'src/theme/overrides/components/button'

// ----------------------------------------------------------------------

const GREEN_COLOR = 'hsla(147, 41%, 21%, 1)'
const CHAT_GREEN = '#25D366'

const StyledRoot = styled('div')(({ theme }) => ({
  backgroundColor: GREEN_COLOR,
  padding: 0,
  overflow: 'hidden',
  position: 'relative',
  borderRadius: '0 0 32px 32px'
}))

const StyledButton = styled(Button)<ButtonProps & { component?: ElementType }>(({ theme }) => ({
  background: `${buttonSheen(theme)}, ${theme.palette.common.white}`,
  color: GREEN_COLOR,
  fontWeight: 600,
  fontSize: '1rem',
  borderRadius: theme.shape.borderRadius,
  boxShadow: buttonEdgeShadow(theme),
  transition: theme.transitions.create(['box-shadow', 'transform', 'background-color'], {
    duration: 200
  }),
  '@media (hover: hover)': {
    '&:hover': {
      background: `${buttonSheen(theme)}, ${theme.palette.grey[100]}`,
      boxShadow: buttonEdgeShadow(theme)
    }
  },
  '&:active': {
    boxShadow: buttonPressedShadow(theme),
    transform: 'scale(0.98)'
  },
  padding: theme.spacing(1.2, 4),
  [theme.breakpoints.down('md')]: {
    fontSize: '0.9rem'
  }
}))

export default function HomeFiatTransfer() {
  const { t } = useTranslate()

  return (
    <StyledRoot>
      <Container
        sx={{
          position: 'relative'
        }}
      >
        <Grid
          container
          spacing={{ xs: 5, md: 3 }}
          alignItems='center'
          justifyContent='center'
          sx={{ position: 'relative' }}
        >
          <Grid
            xs={12}
            md={8}
            sx={{
              textAlign: 'center',
              pt: { xs: 10, md: 18 },
              pb: { xs: 10, md: 18 },
              px: { xs: 2, md: 4 }
            }}
          >
            <m.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              viewport={{ once: false, margin: '-100px' }}
            >
              <Typography
                variant='overline'
                sx={{ color: CHAT_GREEN, letterSpacing: 2, display: 'block', mb: 2 }}
              >
                {t('home.b2b-banner.eyebrow')}
              </Typography>
              <Typography
                variant='h3'
                sx={{
                  mb: 3,
                  color: 'common.white',
                  fontWeight: 700
                }}
              >
                {t('home.b2b-banner.title')}
              </Typography>
            </m.div>

            <m.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              viewport={{ once: false, margin: '-100px' }}
            >
              <Typography
                sx={{
                  mb: 4,
                  color: 'common.white',
                  opacity: 0.8
                }}
              >
                {t('home.b2b-banner.description')}
              </Typography>
            </m.div>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2
              }}
            >
              <m.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
                viewport={{ once: false, margin: '-100px' }}
              >
                <StyledButton
                  component={RouterLink}
                  href={paths.products.b2b}
                  variant='contained'
                  endIcon={
                    <Box
                      component='img'
                      src='/assets/icons/home/landing_resources/button_arrow.svg'
                      alt='Arrow'
                      className='arrow-icon'
                      sx={{ width: 18, height: 18 }}
                    />
                  }
                >
                  {t('home.b2b-banner.button')}
                </StyledButton>
              </m.div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </StyledRoot>
  )
}
