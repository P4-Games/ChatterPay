import Stack from '@mui/material/Stack'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'

import { bgBlur } from 'src/theme/css'
import { useOffSetTop } from 'src/hooks/use-off-set-top'
import { useResponsive } from 'src/hooks/use-responsive'

import Logo from 'src/components/logo'
import SvgColor from 'src/components/svg-color'
import { useSettingsContext } from 'src/components/settings'

import { HEADER } from '../config-layout'
import { useNavWidth } from './use-nav-width'
import AccountPopover from '../common/account-popover'
import SettingsButton from '../common/settings-button'
import LanguagePopover from '../common/language-popover'
import NotificationsButton from '../common/notifications-button'

// ----------------------------------------------------------------------

type Props = {
  onOpenNav?: VoidFunction
}

export default function Header({ onOpenNav }: Props) {
  const theme = useTheme()

  const settings = useSettingsContext()

  const { navWidth } = useNavWidth()

  const isNavHorizontal = settings.themeLayout === 'horizontal'

  const lgUp = useResponsive('up', 'lg')

  const offset = useOffSetTop(HEADER.H_DESKTOP)

  const offsetTop = offset && !isNavHorizontal

  const renderContent = (
    <>
      {lgUp && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}

      {!lgUp && (
        <IconButton onClick={onOpenNav} sx={{ flexShrink: 0 }}>
          <SvgColor src='/assets/icons/navbar/ic_menu_item.svg' />
        </IconButton>
      )}

      <Stack
        flexGrow={1}
        direction='row'
        alignItems='center'
        justifyContent='flex-end'
        spacing={{ xs: 0.25, sm: 1 }}
        sx={{ minWidth: 0, flexWrap: 'nowrap', '& > *': { flexShrink: 0 } }}
      >
        <LanguagePopover />

        <SettingsButton />

        <NotificationsButton />

        <AccountPopover />
      </Stack>
    </>
  )

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        // Fixed and opaque: the page scrolls underneath without showing through the controls. Above
        // the page and below the drawer and the popovers, which sit on the modal layer.
        ...bgBlur({ color: theme.palette.background.default, opacity: 0.94 }),
        boxShadow: 'none',
        transition: theme.transitions.create(['height', 'width'], {
          duration: theme.transitions.duration.shorter
        }),
        ...(lgUp && {
          // +1 for the rail's right border, so the bar starts where the rail ends.
          width: `calc(100% - ${navWidth + 1}px)`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`
          })
        })
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          // Narrow phones need the room: the menu button and the four controls stay on one row.
          px: { xs: 1, sm: 2, lg: 5 }
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  )
}
