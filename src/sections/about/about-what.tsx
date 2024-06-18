import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import LinearProgress from '@mui/material/LinearProgress'

import { useResponsive } from 'src/hooks/use-responsive'

import { fPercent } from 'src/utils/format-number'

import Image from 'src/components/image'
import Iconify from 'src/components/iconify'
import { varFade, MotionViewport } from 'src/components/animate'

// ----------------------------------------------------------------------

export const SKILLS = [...Array(3)].map((_, index) => ({
  label: ['Development', 'Design', 'Marketing'][index],
  value: [20, 40, 60][index]
}))

// ----------------------------------------------------------------------

export default function AboutWhat() {
  const theme = useTheme()

  const mdUp = useResponsive('up', 'md')

  const lightMode = theme.palette.mode === 'light'

  const shadow = `-40px 40px 80px ${alpha(
    lightMode ? theme.palette.grey[500] : theme.palette.common.black,
    0.24
  )}`

  return (
    <Container
      component={MotionViewport}
      sx={{
        py: { xs: 10, md: 15 },
        textAlign: { xs: 'center', md: 'unset' }
      }}
    >
      <Grid container columnSpacing={{ md: 3 }} alignItems='flex-start'>
        {mdUp && (
          <Grid container xs={12} md={6} lg={7} alignItems='center' sx={{ pr: { md: 7 } }}>
            <Grid xs={6}>
              <m.div variants={varFade().inUp}>
                <Image
                  alt='our office 2'
                  src='/assets/images/about/what_2.png'
                  ratio='1/1'
                  sx={{ borderRadius: 3, boxShadow: shadow }}
                />
              </m.div>
            </Grid>

            <Grid xs={6}>
              <m.div variants={varFade().inUp}>
                <Image
                  alt='our office 1'
                  src='/assets/images/about/what_1.png'
                  ratio='3/4'
                  sx={{ borderRadius: 3, boxShadow: shadow }}
                />
              </m.div>
            </Grid>
          </Grid>
        )}

        <Grid xs={12} md={6} lg={5}>
          <m.div variants={varFade().inRight}>
            <Typography variant='h2' sx={{ mb: 3 }}>
              What is ChatterPay?
            </Typography>
          </m.div>

          <m.div variants={varFade().inRight}>
            <Typography
              sx={{
                color: theme.palette.mode === 'light' ? 'text.secondary' : 'common.white'
              }}
            >
              Our theme is the most advanced and user-friendly theme you will find on the market, we
              have documentation and video to help set your site really easily, pre-installed demos
              you can import in one click and everything from the theme options to page content can
              be edited from the front-end. This is the theme you are looking for.
            </Typography>
          </m.div>

          <Stack spacing={3} sx={{ my: 5 }}>
            {SKILLS.map((progress, index) => (
              <Box component={m.div} key={progress.label} variants={varFade().inRight}>
                <Stack direction='row' alignItems='center' sx={{ mb: 1 }}>
                  <Typography variant='subtitle2' sx={{ flexGrow: 1, textAlign: 'left' }}>
                    {progress.label}
                  </Typography>

                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    {fPercent(progress.value)}
                  </Typography>
                </Stack>

                <LinearProgress
                  color={(index === 0 && 'primary') || (index === 1 && 'warning') || 'error'}
                  variant='determinate'
                  value={progress.value}
                />
              </Box>
            ))}
          </Stack>

          <m.div variants={varFade().inRight}>
            <Button
              variant='outlined'
              color='inherit'
              size='large'
              endIcon={<Iconify icon='eva:arrow-ios-forward-fill' />}
            >
              Our Work
            </Button>
          </m.div>
        </Grid>
      </Grid>
    </Container>
    // </Box>
  )
}
