import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'

import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

const GREEN_COLOR = 'hsla(147, 41%, 21%, 1)'

const StyledRoot = styled('div')(({ theme }) => ({
  backgroundColor: GREEN_COLOR,
  padding: 0,
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

export default function HomeFiatTransfer() {
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
          spacing={{ xs: 5, md: 3 }}
          alignItems="center"
          justifyContent="space-between"
          sx={{ position: 'relative' }}
        >
          <Grid xs={12} md={6} sx={{ 
            textAlign: { xs: 'center', md: 'left' },
            py: { xs: 8, md: 10 },
            px: 10
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
                Receive and send fiat like a pro.
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
                Soon you will be able to receive, convert and send fiat to Argentina, Chile, Brazil, Colombia, Mexico, Costa Rica, Guatemala, Philippines.
              </Typography>
            </m.div>

            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              <m.div variants={varFade().inUp}>
                <StyledButton variant="contained">
                  Let&apos;s move some fiat
                </StyledButton>
              </m.div>
            </Box>
          </Grid>
          
          <Box
            sx={{
              position: 'relative',
              left: "auto",
              height: '100%',
              width: '50%',
              display: { xs: 'none', md: 'block' },
              overflow: 'hidden',
            }}
          >
            <m.div variants={varFade().inRight} style={{ height: '100%' }}>
              <Box
                component="img"
                src="/assets/images/home/fiat_like_pro.png"
                alt="Fiat transfer"
                sx={{
                  height: '100%',
                  maxWidth: 'none',
                  objectFit: 'cover',
                  objectPosition: 'center right',
                }}
              />
            </m.div>
          </Box>
        </Grid>
      </Container>
    </StyledRoot>
  )
} 