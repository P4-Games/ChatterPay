'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { useTranslate } from 'src/locales'

import { useStakingStyles } from './staking-style'
import { formatAdaWithUnit, isPositive } from './staking-amount'

import type { StakingView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  staking: StakingView
}

/**
 * Where the user's ADA actually is.
 *
 * Once a credential is registered the balance stops being one number: some of it sits in outputs, some
 * is locked as a refundable deposit, and some is in the reward account. Showing only the first would
 * make a user who staked five ada see three and reasonably conclude that money went missing, so all
 * three are shown and the total is their sum.
 *
 * Rewards still being calculated are shown too and are **not** in the total. They are not withdrawable
 * and they can still change; counting them would report money the user cannot touch.
 *
 * When the balance could not be read, no figure is rendered at all. The backend sends no amounts in
 * that case precisely so there is no zero to mistake for an empty wallet, and this component keeps
 * that promise rather than substituting one.
 *
 * Laid out as an account summary: one figure, a short list of where it sits, and the time it was read.
 */
export default function StakingSummary({ staking }: Props): JSX.Element {
  const { t } = useTranslate()
  const { card, heading } = useStakingStyles()
  const { balance } = staking

  const chip = (
    <Chip
      size='small'
      label={t(`staking.state.${staking.state}`)}
      color={staking.state === 'active' ? 'success' : 'default'}
      variant='outlined'
      data-testid='staking-state'
      sx={{ height: 24, fontSize: '0.75rem' }}
    />
  )

  if (balance.availability === 'unavailable') {
    return (
      <Card sx={card}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={1}>
          <Typography variant='subtitle2'>{t('staking.summary.title')}</Typography>
          {chip}
        </Stack>
        <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1 }}>
          {t('staking.notices.balanceUnavailableBody')}
        </Typography>
      </Card>
    )
  }

  const rows: { key: string; label: string; value: string; hint?: string }[] = [
    {
      key: 'utxo',
      label: t('staking.summary.utxo'),
      value: formatAdaWithUnit(balance.utxoLovelace)
    },
    {
      key: 'deposit',
      label: t('staking.summary.deposit'),
      value: formatAdaWithUnit(balance.userOwnedRefundableDepositLovelace),
      hint: t('staking.summary.depositHint')
    },
    {
      key: 'rewards',
      label: t('staking.summary.rewards'),
      value: formatAdaWithUnit(balance.withdrawableRewardsLovelace)
    }
  ]

  return (
    <Card sx={card}>
      <Stack direction='row' alignItems='flex-start' justifyContent='space-between' spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
            {t('staking.summary.title')}
          </Typography>
          <Typography
            data-testid='staking-total'
            sx={{
              color: heading,
              fontSize: { xs: 24, sm: 28 },
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.24px',
              wordBreak: 'break-word'
            }}
          >
            {formatAdaWithUnit(balance.totalAdaLovelace)}
          </Typography>
        </Box>
        {chip}
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Stack spacing={1}>
        {rows.map((row) => (
          <Stack
            key={row.key}
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            spacing={2}
            data-testid={`staking-${row.key}`}
          >
            <Tooltip title={row.hint ?? ''} placement='top-start'>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {row.label}
              </Typography>
            </Tooltip>
            <Typography variant='caption' sx={{ fontWeight: 600, textAlign: 'right' }}>
              {row.value}
            </Typography>
          </Stack>
        ))}

        {isPositive(balance.pendingRewardsLovelace) && (
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
            spacing={2}
            data-testid='staking-pending'
          >
            <Tooltip title={t('staking.summary.pendingHint')} placement='top-start'>
              <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                {t('staking.summary.pending')}
              </Typography>
            </Tooltip>
            <Typography variant='caption' sx={{ color: 'text.disabled', textAlign: 'right' }}>
              {formatAdaWithUnit(balance.pendingRewardsLovelace)}
            </Typography>
          </Stack>
        )}
      </Stack>

      <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block', mt: 1.5 }}>
        {t('staking.summary.lastSync', {
          date: staking.lastSyncAt
            ? new Date(staking.lastSyncAt).toLocaleString()
            : t('staking.summary.never')
        })}
      </Typography>
    </Card>
  )
}
