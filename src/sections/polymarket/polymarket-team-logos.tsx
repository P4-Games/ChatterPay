'use client'

import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

import type { IPolymarketTeam } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type Props = {
  teams: IPolymarketTeam[]
  /** Square size in px of the composed thumbnail (default 44) */
  size?: number
  /** Border radius applied to the outer box (MUI spacing units, default 1.5) */
  borderRadius?: number
}

/**
 * Composite thumbnail for sports events: the two team flags/crests arranged
 * diagonally (home top-left, away bottom-right), replacing the generic sport
 * image (e.g. a soccer ball) that Polymarket returns as the event image.
 * @param {Props} props - Teams (uses the first two, home first), size and radius.
 * @returns {JSX.Element} The composed logos thumbnail.
 */
export default function PolymarketTeamLogos({ teams, size = 44, borderRadius = 1.5 }: Props) {
  const theme = useTheme()

  // Home first, away second (Gamma sends `ordering: 'home' | 'away'`)
  const sorted = [...teams].sort((a, b) =>
    a.ordering === 'home' ? -1 : b.ordering === 'home' ? 1 : 0
  )
  const [home, away] = sorted

  const logoSize = Math.round(size * 0.66)
  const logoStyle = {
    width: logoSize,
    height: logoSize,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    position: 'absolute' as const,
    border: `2px solid ${theme.palette.background.paper}`,
    bgcolor: 'grey.200'
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        flexShrink: 0,
        borderRadius
      }}
    >
      {home && (
        <Box
          component='img'
          src={home.logo}
          alt={home.name}
          sx={{ ...logoStyle, top: 0, left: 0 }}
        />
      )}
      {away && (
        <Box
          component='img'
          src={away.logo}
          alt={away.name}
          sx={{ ...logoStyle, bottom: 0, right: 0, zIndex: 1 }}
        />
      )}
    </Box>
  )
}
