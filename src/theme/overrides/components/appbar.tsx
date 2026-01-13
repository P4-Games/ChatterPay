import type { Theme } from '@mui/material/styles'

// ----------------------------------------------------------------------

export function appBar(theme: Theme) {
  return {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none'
        }
      }
    }
  }
}
