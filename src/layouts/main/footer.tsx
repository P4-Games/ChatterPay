import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { usePathname } from 'src/routes/hooks'
import { RouterLink } from 'src/routes/components'

import { _socials } from 'src/app/api/_data/_mock'

import Logo from 'src/components/logo'
import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

export default function Footer() {
  const pathname = usePathname()
  // const { t } = useTranslate()

  const homePage = pathname === '/'

  const LINKS = [
    {
      headline: 'ChatterPay',
      children: [
        { name: 'About us', href: '#' },
        { name: 'Contact us', href: '#' },
        { name: 'FAQs', href: '#' }
      ]
    },
    {
      headline: 'Legal',
      children: [
        { name: 'Terms and Condition', href: '#' },
        { name: 'Privacy Policy', href: '#' }
      ]
    },
    {
      headline: 'Contact',
      children: [{ name: 'support@chatterpay.com', href: '#' }]
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
          © All rights reserved
          <br /> made by
          <Link href='https://p4techsolutions.com/'> P4 Tech Solutions </Link>
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
        <Logo sx={{ mb: 3 }} />

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
              Transfer crypto easily through WhatsApp using our Web3 platform.
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
                <IconButton
                  key={social.name}
                  sx={{
                    '&:hover': {
                      bgcolor: alpha(social.color, 0.08)
                    }
                  }}
                >
                  <Iconify color={social.color} icon={social.icon} />
                </IconButton>
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
          © 2024. All rights reserved
        </Typography>
      </Container>
    </Box>
  )

  return homePage ? simpleFooter : mainFooter
}
