import { memo } from 'react'

import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'

import { bgBlur } from 'src/theme/css'
import { useAuthContext } from 'src/auth/hooks'

import Scrollbar from 'src/components/scrollbar'
import { NavSectionHorizontal } from 'src/components/nav-section'

import { HEADER } from '../config-layout'
import { useNavData } from './config-navigation'
import HeaderShadow from '../common/header-shadow'

// ----------------------------------------------------------------------

function NavHorizontal() {
  const theme = useTheme()

  // const { user } = useMockedUser()
  const { user } = useAuthContext()

  const navData = useNavData()

  return (
    <AppBar
      component='div'
      sx={{
        top: HEADER.H_DESKTOP_OFFSET
      }}
    >
      <Toolbar
        sx={{
          ...bgBlur({
            color: theme.palette.background.default
          })
        }}
      >
        <Scrollbar
          sx={{
            '& .simplebar-content': {
              display: 'flex'
            }
          }}
        >
          <NavSectionHorizontal
            data={navData}
            slotProps={{
              currentRole: user?.role
            }}
            sx={{
              ...theme.mixins.toolbar
            }}
          />
        </Scrollbar>
      </Toolbar>

      <HeaderShadow />
    </AppBar>
  )
}

export default memo(NavHorizontal)
