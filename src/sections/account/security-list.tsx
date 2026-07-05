import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import CardContent from '@mui/material/CardContent'
import { alpha, useTheme } from '@mui/material/styles'

import { useSecurityStatus } from 'src/app/api/hooks/use-security'
import { useAuthContext } from 'src/auth/hooks'
import { useTranslate } from 'src/locales'
import { RouterLink } from 'src/routes/components'
import { paths } from 'src/routes/paths'
import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

const rowSx = { px: 2, py: 1.5, borderRadius: 1 }

type BadgeColor = 'success' | 'warning' | 'error' | 'info'

type SecurityRow = {
  href: string
  icon: string
  title: string
  description: string
  badge: { color: BadgeColor; icon: string }
}

/**
 * Security hub list: status, recovery questions, PIN and events, each with
 * a configuration state badge.
 * @returns {JSX.Element} Security list card.
 */
export default function SecurityList() {
  const { t } = useTranslate()
  const theme = useTheme()
  const { user } = useAuthContext()
  const { data: statusResponse } = useSecurityStatus(user?.id)

  const status = statusResponse?.ok ? statusResponse.data : null
  const pinStatus = status?.pinStatus
  const isPinSet = pinStatus !== 'not_set'
  const isPinBlocked = pinStatus === 'blocked'
  const recoveryConfigured = !!status?.recoveryQuestionsSet

  const rows: SecurityRow[] = [
    {
      href: paths.dashboard.user.securityStatus,
      icon: 'solar:shield-check-bold-duotone',
      title: t('user.security.sections.status'),
      description: t('user.security.sections.statusDescription'),
      badge: isPinBlocked
        ? { color: 'error', icon: 'eva:alert-circle-fill' }
        : pinStatus === 'active' && recoveryConfigured
          ? { color: 'success', icon: 'eva:checkmark-fill' }
          : { color: 'warning', icon: 'eva:alert-circle-fill' }
    },
    {
      href: paths.dashboard.user.securityRecovery,
      icon: 'solar:question-circle-bold-duotone',
      title: t('user.security.sections.recoveryQuestions'),
      description: t('user.security.sections.recoveryQuestionsDescription'),
      badge: recoveryConfigured
        ? { color: 'success', icon: 'eva:checkmark-fill' }
        : { color: 'warning', icon: 'eva:alert-circle-fill' }
    },
    {
      href: paths.dashboard.user.securityPin,
      icon: 'solar:lock-password-bold-duotone',
      title: t('user.security.sections.pinManagement'),
      description: t('user.security.sections.pinManagementDescription'),
      badge: isPinSet
        ? { color: 'success', icon: 'eva:checkmark-fill' }
        : { color: 'warning', icon: 'eva:alert-circle-fill' }
    },
    {
      href: paths.dashboard.user.securityEvents,
      icon: 'solar:history-bold-duotone',
      title: t('user.security.sections.events'),
      description: t('user.security.sections.eventsDescription'),
      badge: { color: 'info', icon: 'eva:info-fill' }
    }
  ]

  return (
    <Card
      sx={{
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        boxShadow: theme.customShadows.card
      }}
    >
      <CardContent>
        <List disablePadding>
          {rows.map((row) => (
            <ListItemButton key={row.href} sx={rowSx} component={RouterLink} href={row.href}>
              <Stack
                alignItems='center'
                justifyContent='center'
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  flexShrink: 0,
                  mr: 2
                }}
              >
                <Iconify icon={row.icon} width={22} sx={{ color: 'primary.main' }} />
              </Stack>

              <ListItemText primary={row.title} secondary={row.description} />

              <Stack direction='row' alignItems='center' spacing={1} sx={{ flexShrink: 0, ml: 1 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette[row.badge.color].main, 0.16),
                    color: `${row.badge.color}.main`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Iconify icon={row.badge.icon} width={14} />
                </Box>
                <Iconify
                  icon='eva:arrow-ios-forward-fill'
                  width={18}
                  sx={{ color: 'text.secondary' }}
                />
              </Stack>
            </ListItemButton>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
