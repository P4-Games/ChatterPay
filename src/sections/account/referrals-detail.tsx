import Card from '@mui/material/Card'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import CardContent from '@mui/material/CardContent'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'
import { useSnackbar } from 'src/components/snackbar'
import { useReferralByCode, useReferralCodeWithUsageCount } from 'src/app/api/hooks/use-referral'
import Iconify from 'src/components/iconify'
import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'

// ----------------------------------------------------------------------

const rowSx = { px: 2, py: 1.5, borderRadius: 1 }

/**
 * Icon chip shown at the start of each referral row.
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
 * Referral details list: own code (copyable), usage count and referred-by code.
 * @returns {JSX.Element} Referrals detail card.
 */
export default function ReferralsDetail() {
  const { t } = useTranslate()
  const theme = useTheme()
  const { user } = useAuthContext()
  const { enqueueSnackbar } = useSnackbar()

  const { data: referralStats, isLoading: referralStatsLoading } = useReferralCodeWithUsageCount(
    user?.id
  )
  const { data: referralByCodeData, isLoading: referralByCodeLoading } = useReferralByCode(user?.id)

  const handleCopy = async (value: string) => {
    if (!value || !value.trim()) return
    try {
      await navigator.clipboard.writeText(value)
      enqueueSnackbar(t('common.copied'))
    } catch {
      enqueueSnackbar(t('common.msg.update-error'), { variant: 'error' })
    }
  }

  return (
    <Card
      sx={{
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        boxShadow: theme.customShadows.card
      }}
    >
      <CardContent>
        <List disablePadding>
          <ListItem
            sx={rowSx}
            secondaryAction={
              !!(referralStats?.referralCode || '').trim() && (
                <IconButton
                  size='small'
                  onClick={() => handleCopy(referralStats!.referralCode)}
                  aria-label={t('common.accessibility.copy-referral-code')}
                >
                  <Iconify icon='eva:copy-fill' width={18} />
                </IconButton>
              )
            }
          >
            <RowIcon icon='solar:ticket-bold-duotone' />
            <ListItemText
              primary={t('referrals.my-code')}
              secondary={
                referralStatsLoading ? '...' : referralStats?.referralCode || t('common.nodata')
              }
            />
          </ListItem>

          <ListItem sx={rowSx}>
            <RowIcon icon='solar:chart-2-bold-duotone' />
            <ListItemText
              primary={t('referrals.usage-count').replace(
                '{COUNT}',
                String(referralStats?.referredUsersCount ?? 0)
              )}
            />
          </ListItem>

          {(referralByCodeData?.referralByCode || '').trim() ? (
            <ListItem
              sx={rowSx}
              secondaryAction={
                <IconButton
                  size='small'
                  onClick={() => handleCopy(referralByCodeData!.referralByCode)}
                  aria-label={t('common.accessibility.copy-referred-by-code')}
                >
                  <Iconify icon='eva:copy-fill' width={18} />
                </IconButton>
              }
            >
              <RowIcon icon='solar:link-round-bold' />
              <ListItemText
                primary={t('referrals.referred-by')}
                secondary={referralByCodeData?.referralByCode}
              />
            </ListItem>
          ) : (
            <ListItemButton
              sx={rowSx}
              component={RouterLink}
              href={paths.dashboard.user.referralsReferredCode}
            >
              <RowIcon icon='solar:link-round-bold' />
              <ListItemText
                primary={t('referrals.referred-by')}
                secondary={referralByCodeLoading ? '...' : t('referrals.not-set')}
              />
              <Iconify
                icon='eva:arrow-ios-forward-fill'
                width={18}
                sx={{ color: 'text.secondary' }}
              />
            </ListItemButton>
          )}
        </List>
      </CardContent>
    </Card>
  )
}
