import type { Theme } from '@mui/material/styles'
import { type CheckboxProps, checkboxClasses } from '@mui/material/Checkbox'

// ----------------------------------------------------------------------

export function checkbox(theme: Theme) {
  return {
    MuiCheckbox: {
      styleOverrides: {
        root: ({ ownerState }: { ownerState: CheckboxProps }) => {
          const { color } = ownerState

          return {
            padding: theme.spacing(1),
            ...(color === 'default' && {
              [`&.${checkboxClasses.checked}`]: {
                color: theme.palette.text.primary
              }
            }),
            [`&.${checkboxClasses.disabled}`]: {
              color: theme.palette.action.disabled
            }
          }
        }
      }
    }
  }
}
