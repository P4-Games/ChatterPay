import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

// ----------------------------------------------------------------------

type BreadcrumbLink = {
  name: string
  href?: string
}

type Props = {
  title: string
  description?: string
  links: BreadcrumbLink[]
  children: React.ReactNode
}

/**
 * Shared layout for all user/account pages: gradient-bleed background,
 * breadcrumbs and the system headline. Keeps every settings page visually
 * consistent with the dashboard, polymarket and chatterpoints pages.
 * @param {Props} props - Page title, optional description, breadcrumb links and content.
 * @returns {JSX.Element} Page shell.
 */
export default function UserPageShell({ title, description, links, children }: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const settings = useSettingsContext()

  return (
    <Box
      sx={{
        mt: -13,
        mx: { xs: 0, lg: -2 },
        minHeight: '100vh',
        bgcolor: isDark ? '#0A2E1A' : '#B8F6C9',
        backgroundImage: isDark
          ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 600px)'
          : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 600px)',
        pb: { xs: 10, md: 15 },
        mb: { xs: -10, md: -15 }
      }}
    >
      <Container maxWidth={settings.themeStretch ? false : 'lg'} sx={{ pt: { xs: 15, md: 20 } }}>
        <CustomBreadcrumbs links={links} sx={{ mb: { xs: 2, md: 3 } }} />

        <Stack spacing={1.5} sx={{ mb: { xs: 3, md: 5 }, maxWidth: 560 }}>
          <Typography
            variant='h1'
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: 32, md: 36 },
              letterSpacing: '-0.36px'
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant='body1'
              sx={{
                color: 'text.primary',
                fontSize: 16,
                letterSpacing: '-0.16px',
                lineHeight: 1.5
              }}
            >
              {description}
            </Typography>
          )}
        </Stack>

        {children}
      </Container>
    </Box>
  )
}
