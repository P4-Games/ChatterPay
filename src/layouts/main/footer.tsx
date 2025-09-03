import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'

import { useTranslate } from 'src/locales'
import { _socials, BOT_WAPP_URL, CONTACT_EMAIL } from 'src/config-global'

import Iconify from 'src/components/iconify'
import Logo, { LogoWithName } from 'src/components/logo'

// ----------------------------------------------------------------------

interface FooterProps {
  simple: boolean
}

export default function Footer({ simple }: FooterProps) {
  const { t } = useTranslate()
  const theme = useTheme()
  const lightMode = theme.palette.mode === 'light'
  const contactUsUrl = BOT_WAPP_URL.replaceAll('MESSAGE', t('home.common.contact-us-wapp-msg'))

  const LINKS = [
    {
      headline: 'ChatterPay',
      children: [
        { name: t('home.footer.links.about-us'), href: '/about-us' },
        { name: t('home.footer.links.contact-us'), href: contactUsUrl },
        { name: t('home.footer.links.faqs'), href: '/#faq' }
      ]
    },
    {
      headline: t('home.footer.links.legal'),
      children: [
        { name: t('home.footer.links.terms'), href: paths.terms },
        { name: t('home.footer.links.privacy'), href: paths.policy }
      ]
    },
    {
      headline: t('home.footer.links.contact'),
      children: [{ name: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }]
    }
  ]

  const simpleFooter = (
    <Box
      component='footer'
      sx={{
        py: 5,
        textAlign: 'center',
        position: 'relative',
        bgcolor: 'background.default'
      }}
    >
      <Container>
        <Logo sx={{ mb: 1, mx: 'auto' }} />
        <Typography variant='caption' component='div'>
          © {t('home.footer.all-rights')}
          <br />
          {t('home.footer.made-by')}{' '}
          <Link href='https://p4techsolutions.com/'>P4 Tech Solutions</Link>
        </Typography>
      </Container>
    </Box>
  )

  const mainFooter = (
    <Box
      component='footer'
      sx={{
        position: 'relative',
        bgcolor: 'background.default'
      }}
    >
      <Divider />

      <Container
        sx={{
          pt: 10,
          pb: 5,
          textAlign: { xs: 'center', md: 'unset' }
        }}
      >
        <LogoWithName sx={{ mb: 3, height: { xs: 28, md: 40 } }} />
        <Grid
          container
          justifyContent={{
            xs: 'center',
            md: 'space-between'
          }}
        >
          <Grid xs={8} md={3}>
            <Typography
              variant='body2'
              sx={{
                maxWidth: 270,
                mx: { xs: 'auto', md: 'unset' }
              }}
            >
              {t('home.footer.description')}
            </Typography>

            <Stack
              direction='row'
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{
                mt: 3,
                mb: { xs: 5, md: 0 }
              }}
            >
              {_socials.map((social) => (
                <a
                  key={social.name}
                  href={social.path}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ textDecoration: 'none' }}
                >
                  <IconButton
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(lightMode ? social.colorLight : social.colorDark, 0.08)
                      }
                    }}
                  >
                    <Iconify
                      color={lightMode ? social.colorLight : social.colorDark}
                      icon={social.icon}
                    />
                  </IconButton>
                </a>
              ))}
            </Stack>
          </Grid>

          <Grid xs={12} md={6}>
            <Stack spacing={5} direction={{ xs: 'column', md: 'row' }}>
              {LINKS.map((list) => (
                <Stack
                  key={list.headline}
                  spacing={2}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                  sx={{ width: 1 }}
                >
                  <Typography component='div' variant='overline'>
                    {list.headline}
                  </Typography>

                  {list.children.map((link) => (
                    <Link
                      key={link.name}
                      component={RouterLink}
                      href={link.href}
                      color='inherit'
                      variant='body2'
                    >
                      {link.name}
                    </Link>
                  ))}
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Typography variant='body2' sx={{ mt: 10 }}>
          © 2024. {t('home.footer.all-rights')}
        </Typography>
      </Container>
    </Box>
  )

  return simple ? simpleFooter : mainFooter
}
