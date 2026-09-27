import { useEffect } from 'react'

import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Drawer from '@mui/material/Drawer'

import { usePathname } from 'src/routes/hooks'

import { useResponsive } from 'src/hooks/use-responsive'

import { useAuthContext } from 'src/auth/hooks'

import Logo from 'src/components/logo'
import Scrollbar from 'src/components/scrollbar'
import { NavSectionVertical } from 'src/components/nav-section'

import { NAV } from '../config-layout'
import NavUpgrade from '../common/nav-upgrade'
import { useNavData } from './config-navigation'
import { useNavWidth } from './use-nav-width'
import NavToggleButton from './nav-toggle-button'

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean
  onCloseNav: VoidFunction
}

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const { user } = useAuthContext()

  const pathname = usePathname()

  const lgUp = useResponsive('up', 'lg')

  const navData = useNavData()

  const { isMini, navWidth } = useNavWidth()

  // Collapsing is driven only by the persisted preference. Hover no longer expands the rail: with an
  // explicit control, a pointer crossing the rail would undo the choice the user just made, and it
  // would also make the rendered width disagree with the width the header and main content compute.
  const collapsed = lgUp && isMini

  useEffect(() => {
    if (openNav) {
      onCloseNav()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Box
        sx={{
          height: 80,
          pl: '16px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0
        }}
      >
        <Logo />
      </Box>

      {lgUp && (
        <Box
          sx={{
            px: '16px',
            pb: 1,
            display: 'flex',
            flexShrink: 0,
            justifyContent: collapsed ? 'center' : 'flex-end'
          }}
        >
          <NavToggleButton />
        </Box>
      )}

      <NavSectionVertical
        data={navData}
        slotProps={{
          currentRole: user?.role,
          collapsed
        }}
      />

      <Box sx={{ flexGrow: 1 }} />

      <NavUpgrade collapsed={collapsed} />
    </Scrollbar>
  )

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: navWidth }
      }}
    >
      {lgUp ? (
        <Stack
          component={m.div}
          animate={{ width: navWidth }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          sx={{
            height: 1,
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: (theme) => theme.zIndex.appBar + 2,
            overflow: 'hidden',
            bgcolor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[100] : t.palette.grey[800],
            borderRight: (t) => `dashed 1px ${t.palette.divider}`
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
              bgcolor: (t) =>
                t.palette.mode === 'light' ? t.palette.grey[100] : t.palette.grey[800]
            }
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  )
}
