import { forwardRef } from 'react'

import Link from '@mui/material/Link'
import { useTheme } from '@mui/material/styles'
import Box, { type BoxProps } from '@mui/material/Box'

import { RouterLink } from 'src/routes/components'

// ----------------------------------------------------------------------

export interface LogoWithNameProps extends BoxProps {
  disabledLink?: boolean
  /** preferred height in px; width scales automatically */
  heightPx?: number
  /** force the light (white) variant regardless of theme, e.g. over dark heroes */
  light?: boolean
}

const LogoWithName = forwardRef<HTMLImageElement, LogoWithNameProps>(
  ({ disabledLink = false, sx, heightPx = 36, light = false, ...other }, ref) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const src =
      light || isDark
        ? '/assets/images/home/logo-w-name.svg'
        : '/assets/images/home/logo-w-name-black.svg'

    const img = (
      <Box
        component='img'
        ref={ref}
        src={src}
        alt='ChatterPay'
        sx={{
          display: 'block',
          height: heightPx, // controla el tamaño visible
          width: 'auto', // mantiene proporción horizontal
          // cursor solo si es clickeable
          ...(disabledLink ? {} : { cursor: 'pointer' }),
          ...sx
        }}
        {...other}
      />
    )

    if (disabledLink) {
      return img
    }

    return (
      <Link component={RouterLink} href='/' sx={{ display: 'inline-flex', lineHeight: 0 }}>
        {img}
      </Link>
    )
  }
)

export default LogoWithName
