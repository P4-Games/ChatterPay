import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import { useTheme } from '@mui/material/styles'

import { useOffSetTop } from 'src/hooks/use-off-set-top'
import { useResponsive } from 'src/hooks/use-responsive'

import { bgBlur } from 'src/theme/css'

import Logo from 'src/components/logo'

import NavMobile from './nav/mobile'
import NavDesktop from './nav/desktop'
import { HEADER } from '../config-layout'
import { navConfig } from './config-navigation'
import LoginButton from '../common/login-button'
import HeaderShadow from '../common/header-shadow'
import SettingsButton from '../common/settings-button'
import LanguagePopover from '../common/language-popover'
// ----------------------------------------------------------------------

export default function Header() {
  const theme = useTheme()

  const mdUp = useResponsive('up', 'md')

  const offsetTop = useOffSetTop(HEADER.H_DESKTOP)

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
        <Container sx={{ height: 1, display: 'flex', alignItems: 'center' }}>
          <Logo />
          <Box sx={{ flexGrow: 1 }} />

          {mdUp && <NavDesktop data={navConfig} />}

          <Stack alignItems='right' direction={{ xs: 'row', md: 'row-reverse' }}>
            {mdUp && <LoginButton />}

            {!mdUp && <NavMobile data={navConfig} />}
          </Stack>
        </Container>

        <LanguagePopover />

        <SettingsButton />
      </Toolbar>

      {offsetTop && <HeaderShadow />}
    </AppBar>
  )
}
