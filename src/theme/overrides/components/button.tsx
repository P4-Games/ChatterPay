import { alpha, lighten, type Theme } from '@mui/material/styles'
import { type ButtonProps, buttonClasses } from '@mui/material/Button'

// ----------------------------------------------------------------------

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const

// NEW VARIANT
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    soft: true
  }
}

// ----------------------------------------------------------------------

/**
 * Top sheen highlight from the Figma brand button (node 406:2).
 * Layer it over a solid color: `background: \`${buttonSheen(theme)}, ${color}\``
 */
export const buttonSheen = (theme: Theme) =>
  `radial-gradient(120% 100% at 50% 0%, ${alpha(theme.palette.common.white, 0.3)} 0%, ${alpha(theme.palette.common.white, 0)} 60%)`

/**
 * Outer drop shadow + hard bottom inset edge from the Figma brand button.
 */
export const buttonEdgeShadow = (theme: Theme) =>
  `0 1px 1px rgba(15, 23, 42, 0.06), inset 0 -2px 0 ${alpha(theme.palette.common.black, 0.15)}`

/**
 * Pressed (click) inset shadow, low opacity.
 */
export const buttonPressedShadow = (theme: Theme) =>
  `inset 0 2px 4px ${alpha(theme.palette.common.black, 0.12)}`

// ----------------------------------------------------------------------

export function button(theme: Theme) {
  const lightMode = theme.palette.mode === 'light'

  const rootStyles = (ownerState: ButtonProps) => {
    const inheritColor = ownerState.color === 'inherit'

    const containedVariant = ownerState.variant === 'contained'

    const outlinedVariant = ownerState.variant === 'outlined'

    const textVariant = ownerState.variant === 'text'

    const softVariant = ownerState.variant === 'soft'

    const smallSize = ownerState.size === 'small'

    const mediumSize = ownerState.size === 'medium'

    const largeSize = ownerState.size === 'large'

    const defaultStyle = {
      ...(inheritColor && {
        // CONTAINED
        ...(containedVariant && {
          color: lightMode ? theme.palette.common.white : theme.palette.grey[800],
          backgroundColor: lightMode ? theme.palette.grey[800] : theme.palette.common.white,
          '&:hover': {
            backgroundColor: lightMode ? theme.palette.grey[700] : theme.palette.grey[400]
          }
        }),
        // OUTLINED
        ...(outlinedVariant && {
          borderColor: alpha(theme.palette.grey[500], 0.32),
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          }
        }),
        // TEXT
        ...(textVariant && {
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          }
        }),
        // SOFT
        ...(softVariant && {
          color: theme.palette.text.primary,
          backgroundColor: alpha(theme.palette.grey[500], 0.08),
          '&:hover': {
            backgroundColor: alpha(theme.palette.grey[500], 0.24)
          }
        })
      }),
      ...(outlinedVariant && {
        '&:hover': {
          borderColor: 'currentColor',
          boxShadow: '0 0 0 0.5px currentColor'
        }
      })
    }

    const sheen = buttonSheen(theme)
    const edgeShadow = buttonEdgeShadow(theme)

    const colorStyle = COLORS.map((color) => ({
      ...(ownerState.color === color && {
        // CONTAINED
        ...(containedVariant && {
          background: `${sheen}, ${theme.palette[color].main}`,
          boxShadow: edgeShadow,
          transition: theme.transitions.create(['box-shadow', 'transform', 'background-color'], {
            duration: 200
          }),
          // hover only on devices with real hover (skips sticky hover on touch)
          '@media (hover: hover)': {
            '&:hover': {
              background: `${sheen}, ${lighten(theme.palette[color].main, 0.08)}`,
              boxShadow: edgeShadow
            }
          },
          '&:active': {
            boxShadow: buttonPressedShadow(theme),
            transform: 'scale(0.98)'
          },
          [`&.${buttonClasses.focusVisible}`]: {
            boxShadow: `0 0 0 3px ${alpha(theme.palette[color].main, 0.35)}, inset 0 -2px 0 ${alpha(theme.palette.common.black, 0.15)}`
          },
          // disabled keeps the button surface, just dimmed
          [`&.${buttonClasses.disabled}`]: {
            background: `${sheen}, ${theme.palette[color].main}`,
            boxShadow: edgeShadow,
            color: theme.palette[color].contrastText,
            opacity: 0.48,
            transform: 'none'
          }
        }),
        // SOFT
        ...(softVariant && {
          color: theme.palette[color][lightMode ? 'dark' : 'light'],
          backgroundColor: alpha(theme.palette[color].main, 0.16),
          '&:hover': {
            backgroundColor: alpha(theme.palette[color].main, 0.32)
          }
        })
      })
    }))

    const disabledState = {
      [`&.${buttonClasses.disabled}`]: {
        // SOFT
        ...(softVariant && {
          backgroundColor: theme.palette.action.disabledBackground
        })
      }
    }

    const size = {
      ...(smallSize && {
        height: 30,
        fontSize: 13,
        paddingLeft: 8,
        paddingRight: 8,
        ...(textVariant && {
          paddingLeft: 4,
          paddingRight: 4
        })
      }),
      ...(mediumSize && {
        paddingLeft: 12,
        paddingRight: 12,
        ...(textVariant && {
          paddingLeft: 8,
          paddingRight: 8
        })
      }),
      ...(largeSize && {
        height: 48,
        fontSize: 15,
        paddingLeft: 16,
        paddingRight: 16,
        ...(textVariant && {
          paddingLeft: 10,
          paddingRight: 10
        })
      })
    }

    return [defaultStyle, ...colorStyle, disabledState, size]
  }

  return {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }: { ownerState: ButtonProps }) => rootStyles(ownerState)
      }
    }
  }
}
