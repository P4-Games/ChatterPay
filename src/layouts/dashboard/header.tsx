import Stack from '@mui/material/Stack'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'

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
        <IconButton onClick={onOpenNav} sx={{ pointerEvents: 'auto' }}>
          <SvgColor src='/assets/icons/navbar/ic_menu_item.svg' />
        </IconButton>
      )}

      <Stack
        flexGrow={1}
        direction='row'
        alignItems='center'
        justifyContent='flex-end'
        spacing={{ xs: 0.5, sm: 1 }}
        sx={{ '& > *': { pointerEvents: 'auto' } }}
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
        bgcolor: 'transparent',
        backdropFilter: 'none',
        boxShadow: 'none',
        // The bar is transparent and fixed, so the page scrolls visibly underneath it. Without this
        // the bar still hit-tests across its whole area and swallows clicks on the cards and buttons
        // that pass below it; only its own controls opt back in. The horizontal layout keeps the
        // default behaviour because there the bar is opaque and hides what is under it.
        ...(!isNavHorizontal && { pointerEvents: 'none' }),
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
          px: { lg: 5 }
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  )
}
