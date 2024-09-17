import { m } from 'framer-motion'

import { Box } from '@mui/material'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'

import { useResponsive } from 'src/hooks/use-responsive'

import { useTranslate } from 'src/locales'

import { varFade } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeAllFeatures() {
  const mdUp = useResponsive('up', 'md')
  const { t } = useTranslate()

  /*
  const theme = useTheme()


  const renderSection1 = (
    <Box sx={{mt: 4, ml: 4}}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ marginBottom: 2 }}>
        <m.div variants={varFade().inUp}>
          <Avatar src={_mock.image.avatar(2)} alt='Avatar 1' />
        </m.div>
        <m.div variants={varFade().inUp}>
          <Iconify sx={{ mx: 'auto', width: 48, height: 48 }} icon='/assets/icons/home/ic_ethereum.svg' />
        </m.div>
        <m.div variants={varFade().inUp}>
          <Avatar src={_mock.image.avatar(3)} alt='Avatar 2' />
        </m.div>
      </Stack>
    </Box>
  )

  const renderSection2 = (
    <Box sx={{mt: 4, ml: 4}}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ marginBottom: 2 }}>
        <m.div variants={varFade().inUp}>
          <Avatar src={_mock.image.avatar(2)} alt='Avatar 1' />
        </m.div>
        <m.div variants={varFade().inUp}>
          <Iconify sx={{ mx: 'auto', width: 48, height: 48 }} icon='/assets/icons/home/ic_ethereum.svg' />
        </m.div>

      </Stack>
    </Box>
  )

  const renderCarouselSection = (index: number) => {
    switch (index) {
      case 0:
        return renderSection1
      case 1:
        return renderSection2
      default:
        return renderSection1
    }
  }
  
  const carousel = useCarousel({
    fade: true,
    arrows: true,
    speed: 500,
    ...CarouselDots({
      sx: {
        right: 16,
        bottom: 16,
        position: 'absolute',
        color: 'primary.light'
      }
    })
  })
  
  const renderContent = (
    <Box
    sx={{
      ...bgGradient({
        color: alpha(theme.palette.grey[400], 0.3),
        imgUrl: '/assets/background/overlay_2.jpg'
      }),
      height: '100%',
      width: '100%',
      borderRadius: 2,
      position: 'relative',
      color: 'common.white',
      '.slick-slider, .slick-list, .slick-track, .slick-slide > div': {
        height: 1
      },
      '&:before, &:after': {
        left: 0,
        mx: 2.5,
        right: 0,
        zIndex: -2,
        height: 200,
        bottom: -16,
        content: "''",
        opacity: 0.16,
        borderRadius: 2,
        bgcolor: 'grey.500',
        position: 'absolute'
      },
      '&:after': {
        mx: 1,
        bottom: -8,
        opacity: 0.24
      }
    }}
  >
    <Carousel {...carousel.carouselSettings}>
      {[...Array(6)].map((_, index) => (
          <div key={index}>{renderCarouselSection(index)}</div>
        ))}
    </Carousel>
  </Box>
  )
  */
  const renderContet = (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%'
      }}
    >
      <m.div variants={varFade().in}>
        <Box
          component={m.img}
          src='/assets/images/home/all-features-blue.png'
          alt='chatterpay'
          sx={{
            mt: 15,
            width: '100%',
            height: 'auto',
            borderRadius: '50%'
          }}
        />{' '}
      </m.div>
    </Box>
  )

  // ----------------------------------------------------------------------

  const contactUsBtn = (
    <m.div variants={varFade().inUp}>
      <Button
        size='large'
        color='inherit'
        variant='contained'
        target='_blank'
        rel='noopener'
        href='/'
      >
        {t('home.common.contact-us')}
      </Button>
    </m.div>
  )

  const renderDescription = (
    <Stack
      sx={{
        textAlign: { xs: 'center', md: 'unset' },
        pl: { md: 5 },
        pt: { md: 15 }
      }}
    >
      <m.div variants={varFade().inUp}>
        <Typography component='div' variant='overline' sx={{ color: 'text.disabled' }}>
          {t('home.all-features.tag')}
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography variant='h2' sx={{ my: 3 }}>
          {t('home.all-features.title')}
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography
          sx={{
            mb: 5,
            color: 'text.secondary',
            textAlign: 'left'
          }}
        >
          <ul>
            <li>{t('home.all-features.features.f1')}</li>
            <li>{t('home.all-features.features.f2')}</li>
            <li>{t('home.all-features.features.f3')}</li>
            <li>{t('home.all-features.features.f4')}</li>
            <li>{t('home.all-features.features.f5')}</li>
            <li>
              {t('home.all-features.features.f6')}{' '}
              <a
                target='_blank'
                href='https://app.chatizalo.com/'
                rel='noreferrer'
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                (Chatizalo)
              </a>{' '}
              {t('home.all-features.features.f6-2')}
            </li>
            <li>{t('home.all-features.features.f7')}</li>
            <li>{t('home.all-features.features.f8')}</li>
            <li>{t('home.all-features.features.f9')}</li>
            <li>{t('home.all-features.features.f10')}</li>
            <li>{t('home.all-features.features.f11')}</li>
            <li>{t('home.all-features.features.f12')}</li>
            <li>{t('home.all-features.features.f13')}</li>
          </ul>
        </Typography>
      </m.div>

      {mdUp && contactUsBtn}
    </Stack>
  )

  // ----------------------------------------------------------------------

  return (
    <Box
      sx={{
        pt: { xs: 10, md: 3 },
        pb: { xs: 10, md: 15 },
        bgcolor: (th) => alpha(th.palette.grey[500], 0.04)
      }}
    >
      <Container>
        <Grid container direction={{ xs: 'column', md: 'row-reverse' }} spacing={5}>
          <Grid xs={12} md={7}>
            {renderDescription}
          </Grid>

          {mdUp && (
            <Grid xs={12} md={5}>
              {renderContet}
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  )
}
