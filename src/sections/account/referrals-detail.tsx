import Card from '@mui/material/Card'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemButton from '@mui/material/ListItemButton'
import CardContent from '@mui/material/CardContent'

import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'
import { useSnackbar } from 'src/components/snackbar'
import { useReferralByCode, useReferralCodeWithUsageCount } from 'src/app/api/hooks/use-referral'
import Iconify from 'src/components/iconify'
import { paths } from 'src/routes/paths'
import { RouterLink } from 'src/routes/components'

// ----------------------------------------------------------------------

export default function ReferralsDetail() {
  const { t } = useTranslate()
  const { user } = useAuthContext()
  const { enqueueSnackbar } = useSnackbar()
  const rowSx = { px: 2, py: 1.5 }

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
    <Card>
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
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Iconify icon='eva:pricetags-fill' width={20} />
            </ListItemIcon>
            <ListItemText
              primary={t('referrals.my-code')}
              secondary={
                referralStatsLoading ? '...' : referralStats?.referralCode || t('common.nodata')
              }
            />
          </ListItem>

          <ListItem sx={rowSx}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Iconify icon='eva:bar-chart-fill' width={20} />
            </ListItemIcon>
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
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Iconify icon='eva:link-2-fill' width={20} />
              </ListItemIcon>
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
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Iconify icon='eva:link-2-fill' width={20} />
              </ListItemIcon>
              <ListItemText
                primary={t('referrals.referred-by')}
                secondary={referralByCodeLoading ? '...' : t('referrals.not-set')}
              />
              <Stack direction='row' alignItems='center' spacing={1}>
                <Iconify icon='eva:arrow-ios-forward-fill' width={18} />
              </Stack>
            </ListItemButton>
          )}
        </List>
      </CardContent>
    </Card>
  )
}
