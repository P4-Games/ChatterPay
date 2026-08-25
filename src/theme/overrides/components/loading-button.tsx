import { HugeiconsIcon } from '@hugeicons/react'
import { Loading03Icon } from '@hugeicons/core-free-icons'

import type { Theme } from '@mui/material/styles'
import { type LoadingButtonProps, loadingButtonClasses } from '@mui/lab/LoadingButton'

// ----------------------------------------------------------------------

export function loadingButton(theme: Theme) {
  return {
    MuiLoadingButton: {
      defaultProps: {
        loadingIndicator: <HugeiconsIcon icon={Loading03Icon} size={18} strokeWidth={2} />
      },
      styleOverrides: {
        root: ({ ownerState }: { ownerState: LoadingButtonProps }) => ({
          [`& .${loadingButtonClasses.loadingIndicator} svg`]: {
            animation: 'chatterpay-button-spin 1s linear infinite'
          },
          '@keyframes chatterpay-button-spin': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' }
          },
          // contained keeps its (dimmed) color surface while loading — spinner must contrast
          ...(ownerState.variant === 'contained' &&
            ownerState.color &&
            ownerState.color !== 'inherit' && {
              [`& .${loadingButtonClasses.loadingIndicator}`]: {
                color: theme.palette[ownerState.color].contrastText
              }
            }),
          ...(ownerState.variant === 'soft' && {
            [`& .${loadingButtonClasses.loadingIndicatorStart}`]: {
              left: 10
            },
            [`& .${loadingButtonClasses.loadingIndicatorEnd}`]: {
              right: 14
            },
            ...(ownerState.size === 'small' && {
              [`& .${loadingButtonClasses.loadingIndicatorStart}`]: {
                left: 10
              },
              [`& .${loadingButtonClasses.loadingIndicatorEnd}`]: {
                right: 10
              }
            })
          })
        })
      }
    }
  }
}
