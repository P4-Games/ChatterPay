import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'

import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeAwards() {
  const { t } = useTranslate()

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
        bgcolor: 'background.neutral'
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

        <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ position: 'relative', right: '-' }}>
              {AWARDS.map((award) => (
            <Grid key={award.name} item xs={6} sm={4} md={2.4} sx={{ display: 'flex', alignItems: 'center' }}>
              <m.div variants={varFade().inUp}>
                <Box
                  component="img"
                  src={award.image}
                  alt={award.name}
                  sx={{
                    width: '100%',
                    height: award?.height ?? 82,
                    objectFit: 'contain',
                    opacity: 0.6,
                    transition: 'opacity 0.3s',
                    '&:hover': { opacity: 1 },
                    display: 'flex',
                    margin: 'auto'
                  }}
                />
              </m.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}