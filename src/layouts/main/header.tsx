// src/layouts/main/header.tsx
import Box from '@mui/material/Box'
import { Stack } from '@mui/system'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'

import { paths } from 'src/routes/paths'
import { usePathname } from 'src/routes/hooks'
import { RouterLink } from 'src/routes/components'

import { useOffSetTop } from 'src/hooks/use-off-set-top'
import { useResponsive } from 'src/hooks/use-responsive'

import { bgBlur } from 'src/theme/css'
import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'
import { LogoWithName } from 'src/components/logo'

import NavMobile from './nav/mobile'
import { HEADER } from '../config-layout'
import LoginButton from '../common/login-button'
import HeaderShadow from '../common/header-shadow'
import LanguagePopover from '../common/language-popover'
import SettingsModeButton from '../common/settings-mode-button'

// Pages whose hero has a dark background (header text should be white when not scrolled)
const DARK_HERO_PATHS = [paths.products.b2b]

// ----------------------------------------------------------------------

export default function Header() {
  const theme = useTheme()
  const { t } = useTranslate()
  const mdUp = useResponsive('up', 'md')
  const pathname = usePathname()
  const offsetTop = useOffSetTop(HEADER.H_DESKTOP)

  const hasDarkHero = DARK_HERO_PATHS.some((p) => pathname.startsWith(p))
  const useLight = hasDarkHero && !offsetTop

  // Resolve nav-link color based on hero context
  const navColor = useLight ? 'common.white' : 'text.primary'

  const navConfigMobile = [
    {
      title: t('home.header.about-us'),
      icon: <Iconify icon='solar:info-circle-bold-duotone' />,
      path: paths.aboutUs
    },
    {
      title: t('home.header.products'),
      icon: <Iconify icon='solar:box-bold-duotone' />,
      path: paths.products.root
    },
    {
      title: t('home.header.roadmap'),
      icon: <Iconify icon='solar:map-bold-duotone' />,
      path: paths.roadmap
    },
    {
      title: t('home.header.development'),
      icon: <Iconify icon='solar:magic-stick-bold-duotone' />,
      path: paths.development
    },
    {
      title: t('home.header.b2b'),
      icon: <Iconify icon='solar:case-round-bold-duotone' />,
      path: paths.products.b2b
    },
    {
      title: t('home.header.sign-in'),
      icon: <Iconify icon='solar:wallet-bold-duotone' />,
      path: paths.auth.jwt.login
    }
  ]

  return (
    <AppBar>
      <Toolbar
        disableGutters
        sx={{
          height: { xs: HEADER.H_MOBILE, md: HEADER.H_DESKTOP },
          transition: theme.transitions.create(['height', 'background-color', 'backdrop-filter'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter
          }),
          // Dark-hero pages: subtle frosted dark backdrop so white text pops
          ...(useLight && {
            backgroundColor: 'rgba(11, 43, 27, 0.55)',
            backdropFilter: 'blur(12px)'
          }),
          ...(offsetTop && {
            ...bgBlur({ color: theme.palette.background.default }),
            height: { md: HEADER.H_DESKTOP_OFFSET }
          })
        }}
      >
        <Box
          sx={{
            pl: 2,
            pr: 2,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {mdUp ? (
            <LogoWithName light={useLight} sx={{ height: { xs: 28, md: 40 } }} />
          ) : (
            <NavMobile data={navConfigMobile} />
          )}

          <Stack direction='row' alignItems='center' spacing={2}>
            {mdUp && (
              <Stack direction='row' spacing={3}>
                <Button
                  component={RouterLink}
                  href={paths.aboutUs}
                  sx={{ fontWeight: 600, color: navColor, transition: 'color 0.3s' }}
                >
                  {t('home.header.about-us')}
                </Button>

                <Button
                  component={RouterLink}
                  href={paths.products.root}
                  sx={{ fontWeight: 600, color: navColor, transition: 'color 0.3s' }}
                >
                  {t('home.header.products')}
                </Button>

                <Button
                  component={RouterLink}
                  href={paths.roadmap}
                  sx={{ fontWeight: 600, color: navColor, transition: 'color 0.3s' }}
                >
                  {t('home.header.roadmap')}
                </Button>

                <Button
                  component={RouterLink}
                  href={paths.development}
                  sx={{ fontWeight: 600, color: navColor, transition: 'color 0.3s' }}
                >
                  {t('home.header.development')}
                </Button>

                <Button
                  component={RouterLink}
                  href={paths.products.b2b}
                  sx={{ fontWeight: 600, color: navColor, transition: 'color 0.3s' }}
                >
                  {t('home.header.b2b')}
                </Button>

                <LoginButton
                  sx={{
                    ...(useLight && {
                      color: 'common.white',
                      bgcolor: 'rgba(255,255,255,0.12)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }),
                    transition: 'all 0.3s'
                  }}
                />
              </Stack>
            )}

            <Stack spacing={1} direction='row'>
              <LanguagePopover />
              <SettingsModeButton />
            </Stack>
          </Stack>
        </Box>
      </Toolbar>

      {offsetTop && <HeaderShadow />}
    </AppBar>
  )
}
