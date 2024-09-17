import dynamic from 'next/dynamic'
import { Props as WalktourProps } from 'react-joyride'

import { alpha, useTheme } from '@mui/material/styles'

// ----------------------------------------------------------------------

const Joyride = dynamic(() => import('react-joyride'), {
  ssr: false
})

export default function Walktour({ locale, ...other }: WalktourProps) {
  const theme = useTheme()

  const lightMode = theme.palette.mode === 'light'

  const btnStyles = {
    border: 0,
    margin: 0,
    outline: 0,
    minWidth: 64,
    fontSize: 14,
    padding: '11px 12px',
    borderRadius: theme.shape.borderRadius,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightBold
  }

  const arrowStyles = {
    width: 20,
    height: 10,
    color: theme.palette.background.paper
  }

  return (
    <Joyride
      scrollOffset={120}
      spotlightPadding={16}
      locale={{
        last: 'Close',
        ...locale
      }}
      styles={{
        options: {
          zIndex: 9999,
          arrowColor: arrowStyles.color
        },
        overlay: {
          backgroundColor: alpha(theme.palette.grey[900], 0.8)
        },
        spotlight: {
          borderRadius: theme.shape.borderRadius * 2
        },
        // Beacon
        beacon: {
          outline: 0
        },
        beaconInner: {
          backgroundColor: theme.palette.error.main
        },
        beaconOuter: {
          borderColor: theme.palette.error.main,
          backgroundColor: alpha(theme.palette.error.main, 0.24)
        },
        // Tooltip
        tooltip: {
          padding: 0,
          overflow: 'hidden',
          color: theme.palette.text.primary,
          boxShadow: theme.customShadows.dialog,
          borderRadius: theme.shape.borderRadius * 2,
          backgroundColor: theme.palette.background.paper
        },
        tooltipContainer: {
          textAlign: 'unset',
          lineHeight: 'unset'
        },
        tooltipTitle: {
          padding: theme.spacing(3, 3, 2, 3),
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.h5.fontSize,
          fontWeight: theme.typography.h5.fontWeight,
          lineHeight: theme.typography.h5.lineHeight
        },
        tooltipContent: {
          position: 'relative',
          padding: theme.spacing(0, 3, 3, 3)
        },
        tooltipFooter: {
          marginTop: 0,
          padding: theme.spacing(2.5, 3, 2.5, 2),
          borderTop: `solid 1px ${theme.palette.divider}`
        },
        // Button
        buttonNext: {
          ...btnStyles,
          marginLeft: theme.spacing(1.25),
          color: lightMode ? theme.palette.common.white : theme.palette.grey[800],
          backgroundColor: lightMode ? theme.palette.grey[800] : theme.palette.common.white
        },
        buttonBack: {
          ...btnStyles,
          color: theme.palette.text.primary,
          border: `solid 1px ${alpha(theme.palette.grey[500], 0.32)}`
        },
        buttonSkip: {
          ...btnStyles,
          color: theme.palette.text.primary
        },
        buttonClose: {
          top: 8,
          right: 8,
          width: 12,
          height: 12,
          borderRadius: '50%',
          display: 'inline-flex',
          padding: theme.spacing(1.5),
          color: theme.palette.grey[500]
        }
      }}
      floaterProps={{
        styles: {
          floater: {
            filter: 'none'
          },
          arrow: {
            spread: arrowStyles.width,
            length: arrowStyles.height
          }
        }
      }}
      {...other}
    />
  )
}
