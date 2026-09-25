'use client'

import { alpha, useTheme } from '@mui/material/styles'

// ----------------------------------------------------------------------

/**
 * The visual language the staking screens borrow from the dashboard.
 *
 * It is stated once here rather than repeated per card because the two screens are peers of the
 * portfolio panel, not a section with a look of its own: the accent colour, the card border and the
 * outlined button geometry all come from `dashboard-portfolio-balance`. A component that hard-codes
 * its own values is what makes one card drift a shade away from the rest.
 */
export function useStakingStyles() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  /** The section heading colour, as the portfolio panel uses it. */
  const heading = isDark ? '#B8F6C9' : '#173F35'

  /** The colour of an outlined control. */
  const accent = isDark ? '#7EDBB8' : '#0D352C'

  /** A card: hairline border, no elevation of its own, padding that tightens on a phone. */
  const card = {
    p: { xs: 2, sm: 2.5 },
    border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
  }

  /** A separator between rows inside a card. */
  const divider = `1px solid ${alpha(theme.palette.grey[500], 0.08)}`

  /**
   * An outlined control, in the geometry the dashboard's buttons use.
   *
   * @param color - The control's colour. Destructive actions pass the error colour.
   */
  const outlined = (color: string) => ({
    px: 3,
    py: 1.2,
    color,
    borderColor: color,
    borderWidth: '0.5px',
    '&:hover': {
      borderColor: color,
      bgcolor: alpha(color, 0.06),
      borderWidth: '0.5px'
    }
  })

  return { theme, isDark, heading, accent, card, divider, outlined }
}
