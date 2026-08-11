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
import { DEFAULT_CHAIN_ID } from 'src/config-global'
import { getChainName } from 'src/config-chains'

import type { IAccountWallet } from 'src/types/account'

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
 * Round status badge shown at the end of a profile row, same grammar as the
 * security list, so the hub card and the row agree on what is still missing.
 * @param {{ color: 'success' | 'warning'; icon: string }} props - Badge colour and icon.
 * @returns {JSX.Element} Status badge.
 */
function RowBadge({ color, icon }: { color: 'success' | 'warning'; icon: string }) {
  const theme = useTheme()

  return (
    <Stack
      alignItems='center'
      justifyContent='center'
      sx={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        bgcolor: alpha(theme.palette[color].main, 0.16),
        color: `${color}.main`,
        flexShrink: 0,
        ml: 1
      }}
    >
      <Iconify icon={icon} width={14} />
    </Stack>
  )
}

/**
 * Profile details list: name, phone, wallets (one per network, copyable) and email.
 * @returns {JSX.Element} Profile detail card.
 */
export default function ProfileDetail() {
  const { t } = useTranslate()
  const theme = useTheme()
  const { user } = useAuthContext()
  const { enqueueSnackbar } = useSnackbar()

  const emailConfigured = !!(user?.email || '').trim()

  const handleCopy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      enqueueSnackbar(t('common.copied'))
    } catch {
      enqueueSnackbar(t('common.msg.update-error'), { variant: 'error' })
    }
  }

  // A user owns one wallet per network they have operated on. The list comes
  // from the API already ordered with the active network first; fall back to the
  // single active wallet for sessions created before wallets travelled in the payload.
  const wallets: IAccountWallet[] =
    Array.isArray(user?.wallets) && user.wallets.length
      ? user.wallets
      : user?.wallet
        ? [
            {
              wallet_proxy: user.wallet,
              wallet_eoa: user.walletEOA || '',
              chain_id: DEFAULT_CHAIN_ID
            }
          ]
        : []

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

          {wallets.length === 0 ? (
            <ListItem sx={rowSx}>
              <RowIcon icon='solar:wallet-bold-duotone' />
              <ListItemText
                primary={t('user.profile.rows.wallet')}
                secondary={t('common.nodata')}
              />
            </ListItem>
          ) : (
            wallets.map((w) => (
              <ListItem key={`${w.chain_id}-${w.wallet_proxy}`} sx={rowSx}>
                <RowIcon icon='solar:wallet-bold-duotone' />
                <ListItemText
                  primary={`${t('user.profile.rows.wallet')} · ${getChainName(w.chain_id)}`}
                  secondary={w.wallet_proxy}
                  secondaryTypographyProps={{ sx: { wordBreak: 'break-all' } }}
                />
                <IconButton
                  size='small'
                  onClick={() => handleCopy(w.wallet_proxy)}
                  aria-label={t('common.accessibility.copy-wallet')}
                  sx={{ ml: 1 }}
                >
                  <Iconify icon='eva:copy-fill' width={18} />
                </IconButton>
              </ListItem>
            ))
          )}

          <ListItemButton sx={rowSx} component={RouterLink} href={paths.dashboard.user.email}>
            <RowIcon icon='solar:letter-bold-duotone' />
            <ListItemText
              primary={t('user.profile.rows.email')}
              secondary={user?.email || t('common.nodata')}
            />
            {emailConfigured ? (
              <RowBadge color='success' icon='eva:checkmark-fill' />
            ) : (
              <RowBadge color='warning' icon='eva:alert-circle-fill' />
            )}
            <Iconify
              icon='eva:arrow-ios-forward-fill'
              width={18}
              sx={{ color: 'text.secondary', ml: 1 }}
            />
          </ListItemButton>
        </List>
      </CardContent>
    </Card>
  )
}
