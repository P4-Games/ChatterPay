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
import { BOT_WAPP_URL } from 'src/config-global'

import { varFade } from 'src/components/animate'

// ----------------------------------------------------------------------

export default function HomeAllFeatures() {
  const mdUp = useResponsive('up', 'md')
  const { t } = useTranslate()
  const contactUsUrl = BOT_WAPP_URL.replaceAll('MESSAGE', t('home.common.contact-us-wapp-msg'))

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
        href={contactUsUrl}
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
