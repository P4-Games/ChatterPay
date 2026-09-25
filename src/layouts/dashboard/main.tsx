import Box, { type BoxProps } from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

import { useResponsive } from 'src/hooks/use-responsive'

import { useSettingsContext } from 'src/components/settings'

import { HEADER } from '../config-layout'
import { useNavWidth } from './use-nav-width'

// ----------------------------------------------------------------------

const SPACING = 8

export default function Main({ children, sx, ...other }: BoxProps) {
  const theme = useTheme()

  const settings = useSettingsContext()

  const lgUp = useResponsive('up', 'lg')

  const { navWidth } = useNavWidth()

  const isNavHorizontal = settings.themeLayout === 'horizontal'

  if (isNavHorizontal) {
    return (
      <Box
        component='main'
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: 'column',
          pt: `${HEADER.H_MOBILE + 24}px`,
          pb: 10,
          ...(lgUp && {
            pt: `${HEADER.H_MOBILE * 2 + 40}px`,
            pb: 15
          })
        }}
      >
        {children}
      </Box>
    )
  }

  return (
    <Box
      component='main'
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        py: `${HEADER.H_MOBILE + SPACING}px`,
        ...(lgUp && {
          px: 2,
          py: `${HEADER.H_DESKTOP + SPACING}px`,
          width: `calc(100% - ${navWidth}px)`,
          transition: theme.transitions.create('width', {
            duration: theme.transitions.duration.standard
          })
        }),
        ...sx
      }}
      {...other}
    >
      {children}
    </Box>
  )
}
