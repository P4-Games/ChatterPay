import Box from '@mui/material/Box'
import { Stack } from '@mui/system'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'

import { paths } from 'src/routes/paths'
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

// ----------------------------------------------------------------------

export default function Header() {
  const theme = useTheme()

  const { t } = useTranslate()

  const mdUp = useResponsive('up', 'md')

  const offsetTop = useOffSetTop(HEADER.H_DESKTOP)

  const navConfigMobile = [
    {
      title: t('home.header.about-us'),
      icon: <Iconify icon='solar:info-circle-bold-duotone' />,
      path: paths.aboutUs
    },
    {
      title: t('home.header.sign-in'),
      icon: <Iconify icon='solar:wallet-bold-duotone' />,
      path: paths.dashboard.root
    }
  ]

  return (
    <AppBar>
      <Toolbar
        disableGutters
        sx={{
          height: {
            xs: HEADER.H_MOBILE,
            md: HEADER.H_DESKTOP
          },
          transition: theme.transitions.create(['height'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter
          }),
          ...(offsetTop && {
            ...bgBlur({
              color: theme.palette.background.default
            }),
            height: {
              md: HEADER.H_DESKTOP_OFFSET
            }
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
            <LogoWithName sx={{ height: { xs: 28, md: 40 } }} />
          ) : (
            <NavMobile data={navConfigMobile} />
          )}
          <Stack direction='row' alignItems='center' spacing={2}>
            {mdUp && (
              <Stack direction='row' spacing={3}>
                <Button
                  component={RouterLink}
                  href={paths.aboutUs}
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  {t('home.header.about-us')}
                </Button>
                <LoginButton />
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
