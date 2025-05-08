import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'

import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeAwards() {
  const { t } = useTranslate()
  const theme = useTheme()

  // Estandarizar la altura del contenedor, no de los iconos
  const STANDARD_CONTAINER_HEIGHT = 100;
  const STANDARD_CONTAINER_MIN_WIDTH = 180;

  const AWARDS = [
    { name: 'Scroll', image: '/assets/images/home/awards/scroll.svg', height: 40 },
    { name: 'Internet Computer', image: '/assets/images/home/awards/icp.png' },
    { name: 'The Graph', image: '/assets/images/home/awards/the_graph.svg', height: 37 },
    { name: 'API3', image: '/assets/images/home/awards/api3.png' },
    { name: 'Level Up', image: '/assets/images/home/awards/levelup.svg', height: 35 },
    { name: 'Push', image: '/assets/images/home/awards/push.png', height: 50 },
    { name: 'Circle', image: '/assets/images/home/awards/circle.png' },
    { name: 'Ethereum Argentina', image: '/assets/images/home/awards/etharg.png' },
    { name: 'Ethereum Uruguay', image: '/assets/images/home/awards/ethuy.png' }
  ]

  return (
    <Box
      sx={{
        pb: { xs: 8, md: 10 },
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.neutral',
        mb: -12
      }}
    >
      <Container component={MotionViewport}>
        <Stack spacing={3} sx={{ textAlign: 'center', mb: 6 }}>
          <m.div variants={varFade().inUp}>
            <Typography variant="h3">
              {t('home.awards.title', { defaultValue: 'Awarded by the best:' })}
            </Typography>
          </m.div>
        </Stack>

        <Grid 
          container 
          spacing={{ xs: 3, md: 4 }} 
          justifyContent="center" 
          alignItems="center" 
          sx={{ 
            position: 'relative', 
            right: '-',
            mx: 'auto',
          }}
        >
          {AWARDS.map((award) => (
            <Grid 
              key={award.name} 
              item 
              xs={6} 
              sm={4} 
              md={2.4} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <m.div 
                variants={varFade().inUp} 
                style={{ 
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box 
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    minWidth: { xs: 120, sm: STANDARD_CONTAINER_MIN_WIDTH },
                    height: STANDARD_CONTAINER_HEIGHT,
                    mx: 'auto',
                    p: 3,
                    ...(theme.palette.mode === 'dark' && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-10px',
                        left: '-10px',
                        right: '-10px',
                        bottom: '-10px',
                        borderRadius: 2,
                        backgroundColor: alpha('#fff', 0.15),
                        border: `1px solid ${alpha('#9e9e9e', 0.2)}`,
                        zIndex: 0,
                      }
                    })
                  }}
                >
                  <Box
                    component="img"
                    src={award.image}
                    alt={award.name}
                    sx={{
                      width: '100%',
                      maxWidth: { xs: '85%', md: '90%' },
                      height: award?.height ?? 82,
                      objectFit: 'contain',
                      opacity: theme.palette.mode === 'dark' ? 1 : 0.6,
                      transition: 'opacity 0.3s',
                      '&:hover': { opacity: 1 },
                      display: 'block',
                      margin: 0,
                      filter: theme.palette.mode === 'dark' ? 'brightness(1.8)' : 'none',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                </Box>
              </m.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Section end rounded borders */}
      <Box
        sx={{
          height: 64,
          width: '100%',
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.background.default 
            : '#F4F6F8',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          bottom: -12,
          position: 'relative',
          zIndex: 10,
        }}
      />
    </Box>
  )
}