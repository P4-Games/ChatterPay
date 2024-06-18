import { useEffect } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Drawer from '@mui/material/Drawer'

import { usePathname } from 'src/routes/hooks'

import { useResponsive } from 'src/hooks/use-responsive'
import { useMockedUser } from 'src/hooks/use-mocked-user'

import Logo from 'src/components/logo'
import Scrollbar from 'src/components/scrollbar'
import { NavSectionVertical } from 'src/components/nav-section'

import { NAV } from '../config-layout'
import NavUpgrade from '../common/nav-upgrade'
import { useNavData } from './config-navigation'
import NavToggleButton from '../common/nav-toggle-button'

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean
  onCloseNav: VoidFunction
}

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const { user } = useMockedUser()

  const pathname = usePathname()

  const lgUp = useResponsive('up', 'lg')

  const navData = useNavData()

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
      <Logo sx={{ mt: 3, ml: 4, mb: 1 }} />

      <NavSectionVertical
        data={navData}
        slotProps={{
          currentRole: user?.role
        }}
      />

      <Box sx={{ flexGrow: 1 }} />

      <NavUpgrade />
    </Scrollbar>
  )

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL }
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`
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
              width: NAV.W_VERTICAL
            }
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  )
}
