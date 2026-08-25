import type { Props } from 'simplebar-react'

import type { Theme, SxProps } from '@mui/material/styles'

// ----------------------------------------------------------------------

export interface ScrollbarProps extends Props {
  children?: React.ReactNode
  sx?: SxProps<Theme>
}
