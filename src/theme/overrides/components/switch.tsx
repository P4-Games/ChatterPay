import { type Theme, alpha } from '@mui/material/styles'
import { type SwitchProps, switchClasses } from '@mui/material/Switch'

// ----------------------------------------------------------------------

export function switches(theme: Theme) {
  const lightMode = theme.palette.mode === 'light'

  const rootStyles = (ownerState: SwitchProps) => {
    const { color } = ownerState

    return {
      width: 58,
      height: 38,
      padding: '9px 13px 9px 12px',
      [`& .${switchClasses.thumb}`]: {
        width: 14,
        height: 14,
        boxShadow: 'none',
        color: theme.palette.common.white
      },
      [`& .${switchClasses.track}`]: {
        opacity: 1,
        borderRadius: 14,
        backgroundColor: alpha(theme.palette.grey[500], 0.48)
      },
      [`& .${switchClasses.switchBase}`]: {
        left: 3,
        padding: 12,
        [`&.${switchClasses.checked}`]: {
          transform: 'translateX(13px)',
          [`& .${switchClasses.thumb}`]: {
            ...(color === 'default' &&
              !lightMode && {
                color: theme.palette.grey[800]
              })
          },
          [`&+.${switchClasses.track}`]: {
            opacity: 1,
            ...(color === 'default' && {
              backgroundColor: theme.palette.text.primary
            })
          }
        },
        [`&.${switchClasses.disabled}`]: {
          [`& .${switchClasses.thumb}`]: {
            opacity: lightMode ? 1 : 0.48
          },
          [`&+.${switchClasses.track}`]: {
            opacity: 0.48
          }
        }
      },
      // Small
      [`&.${switchClasses.sizeSmall}`]: {
        padding: '4px 8px 4px 7px',
        width: 40,
        height: 24,
        [`& .${switchClasses.thumb}`]: {
          width: 10,
          height: 10
        },
        [`& .${switchClasses.switchBase}`]: {
          padding: 7,
          [`&.${switchClasses.checked}`]: {
            transform: 'translateX(9px)'
          }
        }
      }
    }
  }

  return {
    MuiSwitch: {
      styleOverrides: {
        root: ({ ownerState }: { ownerState: SwitchProps }) => rootStyles(ownerState)
      }
    }
  }
}
