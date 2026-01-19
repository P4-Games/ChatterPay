import Card from '@mui/material/Card'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import Iconify from 'src/components/iconify'

import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'
import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'
import { useSnackbar } from 'src/components/snackbar'

// ----------------------------------------------------------------------

export default function ProfileDetail() {
  const { t } = useTranslate()
  const { user } = useAuthContext()
  const { enqueueSnackbar } = useSnackbar()
  const rowSx = { px: 2, py: 1.5 }

  return (
    <Card>
      <CardContent>
        <List disablePadding>
          <ListItemButton sx={rowSx} component={RouterLink} href={paths.dashboard.user.profileName}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Iconify icon='eva:person-fill' width={20} />
            </ListItemIcon>
            <ListItemText
              primary={t('user.profile.rows.name')}
              secondary={user?.displayName || t('common.nodata')}
            />
            <ListItemIcon sx={{ minWidth: 0 }}>
              <Iconify icon='eva:arrow-ios-forward-fill' width={18} />
            </ListItemIcon>
          </ListItemButton>

          <ListItem sx={rowSx}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Iconify icon='eva:phone-fill' width={20} />
            </ListItemIcon>
            <ListItemText
              primary={t('user.profile.rows.phone')}
              secondary={user?.phoneNumber || t('common.nodata')}
            />
          </ListItem>

          <ListItem sx={rowSx}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Iconify icon='eva:credit-card-fill' width={20} />
            </ListItemIcon>
            <ListItemText
              primary={t('user.profile.rows.wallet')}
              secondary={user?.wallet || t('common.nodata')}
            />
            {!!(user?.wallet || '').trim() && (
              <ListItemIcon sx={{ minWidth: 0 }}>
                <IconButton
                  size='small'
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(user!.wallet)
                      enqueueSnackbar(t('common.copied'))
                    } catch {
                      enqueueSnackbar(t('common.msg.update-error'), { variant: 'error' })
                    }
                  }}
                  aria-label={t('common.accessibility.copy-wallet')}
                >
                  <Iconify icon='eva:copy-fill' width={18} />
                </IconButton>
              </ListItemIcon>
            )}
          </ListItem>

          <ListItemButton sx={rowSx} component={RouterLink} href={paths.dashboard.user.email}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Iconify icon='eva:email-fill' width={20} />
            </ListItemIcon>
            <ListItemText
              primary={t('user.profile.rows.email')}
              secondary={user?.email || t('common.nodata')}
            />
            <ListItemIcon sx={{ minWidth: 0 }}>
              <Iconify icon='eva:arrow-ios-forward-fill' width={18} />
            </ListItemIcon>
          </ListItemButton>
        </List>
      </CardContent>
    </Card>
  )
}
