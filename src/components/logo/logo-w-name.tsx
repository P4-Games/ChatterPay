import { forwardRef } from 'react'

import Link from '@mui/material/Link'
import Box, { BoxProps } from '@mui/material/Box'

import { RouterLink } from 'src/routes/components'

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean
}

const LogoWithName = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {
    const logo = (
      <Box
        component='img'
        src='/assets/images/home/logo-w-name.png'
        alt='chatterpay'
        sx={{ width: 40, height: 40, borderRadius: '90%', cursor: 'pointer', ...sx }}
      />
    )

    if (disabledLink) {
      return logo
    }

    return (
      <Link component={RouterLink} href='/' sx={{ display: 'contents' }}>
        {logo}
      </Link>
    )
  }
)

export default LogoWithName
