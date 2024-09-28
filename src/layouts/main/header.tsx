import Box from '@mui/material/Box'
import { Stack } from '@mui/system'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'

import { paths } from 'src/routes/paths'

import { useOffSetTop } from 'src/hooks/use-off-set-top'
import { useResponsive } from 'src/hooks/use-responsive'

import { bgBlur } from 'src/theme/css'
import { useTranslate } from 'src/locales'

import Logo from 'src/components/logo'
import Iconify from 'src/components/iconify'

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
      title: t('login.my-wallet'),
      icon: <Iconify icon='solar:wallet-bold-duotone' />,
      path: paths.auth.jwt.register
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
          {mdUp ? <Logo /> : <NavMobile data={navConfigMobile} />}
          <Stack direction='row' alignItems='right' spacing={2}>
            {mdUp && (
              <Stack direction='row'>
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
