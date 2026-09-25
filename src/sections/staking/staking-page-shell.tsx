'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import { useSettingsContext } from 'src/components/settings'

import { useStakingStyles } from './staking-style'
import StakingTabs from './staking-tabs'

// ----------------------------------------------------------------------

type Props = {
  title: string
  children: React.ReactNode
}

// ----------------------------------------------------------------------

/**
 * The frame both pages of the staking section sit in.
 *
 * One component rather than one per page, because the two are tabs of the same section: a container
 * width, a gradient and a spacing rhythm declared twice drift apart, and the seam shows when the user
 * moves between the tabs — which is the one moment both are compared.
 *
 * The gradient is the dashboard's, and it bleeds past the content the same way the NFTs page does:
 * the negative bottom margin pulls the following whitespace up under it so the colour reaches the
 * end of the viewport on a short page instead of stopping at a visible line.
 */
export default function StakingPageShell({ title, children }: Props): JSX.Element {
  const settings = useSettingsContext()
  const { isDark, heading } = useStakingStyles()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: isDark ? '#0A2E1A' : '#B8F6C9',
        backgroundImage: isDark
          ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 600px)'
          : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 600px)',
        pb: { xs: 10, md: 15 },
        mb: { xs: -10, md: -15 }
      }}
    >
      <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ pt: { xs: 3, md: 4 } }}>
        <Typography variant='h5' sx={{ mb: 2, color: heading, fontWeight: 700 }}>
          {title}
        </Typography>

        <StakingTabs />

        <Stack spacing={2}>{children}</Stack>
      </Container>
    </Box>
  )
}
