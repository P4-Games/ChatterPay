import { useState, useEffect } from 'react'

import { m } from 'framer-motion'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Drawer from '@mui/material/Drawer'

import { usePathname } from 'src/routes/hooks'

import { useResponsive } from 'src/hooks/use-responsive'

import { useAuthContext } from 'src/auth/hooks'

import Logo from 'src/components/logo'
import Scrollbar from 'src/components/scrollbar'
import { useSettingsContext } from 'src/components/settings'
import { NavSectionVertical } from 'src/components/nav-section'

import { NAV } from '../config-layout'
import NavUpgrade from '../common/nav-upgrade'
import { useNavData } from './config-navigation'

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean
  onCloseNav: VoidFunction
}

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const { user } = useAuthContext()

  const pathname = usePathname()

  const lgUp = useResponsive('up', 'lg')

  const settings = useSettingsContext()

  const navData = useNavData()

  const [hovered, setHovered] = useState(false)

  const isMini = settings.themeLayout === 'mini'

  const collapsed = lgUp && isMini && !hovered

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
        width: { lg: isMini ? NAV.W_MINI : NAV.W_VERTICAL }
      }}
    >
      {lgUp ? (
        <Stack
          component={m.div}
          animate={{ width: collapsed ? NAV.W_MINI : NAV.W_VERTICAL }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          sx={{
            height: 1,
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: (theme) => theme.zIndex.appBar + 2,
            overflow: 'hidden',
            bgcolor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[100] : t.palette.grey[800],
            borderRight: (t) => `dashed 1px ${t.palette.divider}`,
            // Expands over the content instead of pushing it — no page reflow on hover.
            boxShadow: (t) => (isMini && hovered ? t.customShadows.z24 : 'none')
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
