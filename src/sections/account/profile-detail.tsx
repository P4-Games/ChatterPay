import Card from '@mui/material/Card'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import { alpha, useTheme } from '@mui/material/styles'

import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'
import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'
import { useSnackbar } from 'src/components/snackbar'
import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

const rowSx = { px: 2, py: 1.5, borderRadius: 1 }

/**
 * Icon chip shown at the start of each profile row.
 * @param {{ icon: string }} props - Iconify icon name.
 * @returns {JSX.Element} Rounded icon chip.
 */
function RowIcon({ icon }: { icon: string }) {
  const theme = useTheme()

  return (
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
      <Iconify icon={icon} width={22} sx={{ color: 'primary.main' }} />
    </Stack>
  )
}

/**
 * Profile details list: name, phone, wallet (copyable) and email.
 * @returns {JSX.Element} Profile detail card.
 */
export default function ProfileDetail() {
  const { t } = useTranslate()
  const theme = useTheme()
  const { user } = useAuthContext()
  const { enqueueSnackbar } = useSnackbar()

  return (
    <Card
      sx={{
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        boxShadow: theme.customShadows.card
      }}
    >
      <CardContent>
        <List disablePadding>
          <ListItemButton sx={rowSx} component={RouterLink} href={paths.dashboard.user.profileName}>
            <RowIcon icon='solar:user-rounded-bold-duotone' />
            <ListItemText
              primary={t('user.profile.rows.name')}
              secondary={user?.displayName || t('common.nodata')}
            />
            <Iconify
              icon='eva:arrow-ios-forward-fill'
              width={18}
              sx={{ color: 'text.secondary' }}
            />
          </ListItemButton>

          <ListItem sx={rowSx}>
            <RowIcon icon='solar:phone-bold-duotone' />
            <ListItemText
              primary={t('user.profile.rows.phone')}
              secondary={user?.phoneNumber || t('common.nodata')}
            />
          </ListItem>

          <ListItem sx={rowSx}>
            <RowIcon icon='solar:wallet-bold-duotone' />
            <ListItemText
              primary={t('user.profile.rows.wallet')}
              secondary={user?.wallet || t('common.nodata')}
              secondaryTypographyProps={{ sx: { wordBreak: 'break-all' } }}
            />
            {!!(user?.wallet || '').trim() && (
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
                sx={{ ml: 1 }}
              >
                <Iconify icon='eva:copy-fill' width={18} />
              </IconButton>
            )}
          </ListItem>

          <ListItemButton sx={rowSx} component={RouterLink} href={paths.dashboard.user.email}>
            <RowIcon icon='solar:letter-bold-duotone' />
            <ListItemText
              primary={t('user.profile.rows.email')}
              secondary={user?.email || t('common.nodata')}
            />
            <Iconify
              icon='eva:arrow-ios-forward-fill'
              width={18}
              sx={{ color: 'text.secondary' }}
            />
          </ListItemButton>
        </List>
      </CardContent>
    </Card>
  )
}
