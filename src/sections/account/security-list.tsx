import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { useSecurityStatus } from 'src/app/api/hooks/use-security'
import { useAuthContext } from 'src/auth/hooks'
import Iconify from 'src/components/iconify'
import { useTranslate } from 'src/locales'
import { RouterLink } from 'src/routes/components'
import { paths } from 'src/routes/paths'

// ----------------------------------------------------------------------

export default function SecurityList() {
  const { t } = useTranslate()
  const { user } = useAuthContext()
  const { data: statusResponse } = useSecurityStatus(user?.id)
  const rowSx = { px: 2, py: 1.5 }
  const status = statusResponse?.ok ? statusResponse.data : null
  const pinStatus = status?.pinStatus
  const isPinSet = pinStatus !== 'not_set'
  const isPinBlocked = pinStatus === 'blocked'
  const recoveryConfigured = !!status?.recoveryQuestionsSet

  const statusBadge = isPinBlocked
    ? { color: 'error.main', icon: 'eva:alert-circle-fill' }
    : pinStatus === 'active' && recoveryConfigured
      ? { color: 'success.main', icon: 'eva:checkmark-fill' }
      : { color: 'warning.main', icon: 'eva:alert-circle-fill' }

  const recoveryBadge = recoveryConfigured
    ? { color: 'success.main', icon: 'eva:checkmark-fill' }
    : { color: 'warning.main', icon: 'eva:alert-circle-fill' }

  const pinBadge = isPinSet
    ? { color: 'success.main', icon: 'eva:checkmark-fill' }
    : { color: 'warning.main', icon: 'eva:alert-circle-fill' }

  return (
    <Card>
      <CardContent>
        <List disablePadding>
          <ListItemButton
            sx={rowSx}
            component={RouterLink}
            href={paths.dashboard.user.securityStatus}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Iconify icon='eva:shield-fill' width={20} />
            </ListItemIcon>
            <ListItemText
              primary={t('user.security.sections.status')}
              secondary={t('user.security.sections.statusDescription')}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: statusBadge.color,
                  color: 'common.white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Iconify icon={statusBadge.icon} width={14} />
              </Box>
              <Iconify icon='eva:arrow-ios-forward-fill' width={18} />
            </Box>
          </ListItemButton>

          <ListItemButton
            sx={rowSx}
            component={RouterLink}
            href={paths.dashboard.user.securityRecovery}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Iconify icon='eva:question-mark-circle-fill' width={20} />
            </ListItemIcon>
            <ListItemText
              primary={t('user.security.sections.recoveryQuestions')}
              secondary={t('user.security.sections.recoveryQuestionsDescription')}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: recoveryBadge.color,
                  color: 'common.white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Iconify icon={recoveryBadge.icon} width={14} />
              </Box>
              <Iconify icon='eva:arrow-ios-forward-fill' width={18} />
            </Box>
          </ListItemButton>

          <ListItemButton sx={rowSx} component={RouterLink} href={paths.dashboard.user.securityPin}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Iconify icon='eva:lock-fill' width={20} />
            </ListItemIcon>
            <ListItemText
              primary={t('user.security.sections.pinManagement')}
              secondary={t('user.security.sections.pinManagementDescription')}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: pinBadge.color,
                  color: 'common.white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Iconify icon={pinBadge.icon} width={14} />
              </Box>
              <Iconify icon='eva:arrow-ios-forward-fill' width={18} />
            </Box>
          </ListItemButton>
        </List>
      </CardContent>
    </Card>
  )
}
