'use client'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import Iconify from 'src/components/iconify'
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard'

import { fDate, fTime } from 'src/utils/format-time'
import { useTranslate } from 'src/locales'

import { formatAdaWithUnit } from './staking-amount'

import type { StakingOperationView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

type Props = {
  open: boolean
  onClose: VoidFunction
  operation: StakingOperationView | null
  /** Where a transaction id links to, with a trailing slash. Absent hides the link. */
  explorerUrl?: string
}

/** How much of a transaction id is enough to recognise it on one line. */
const ID_PREFIX = 12

// ----------------------------------------------------------------------

/**
 * One row of a detail list.
 *
 * @param label - What the figure is.
 * @param value - The figure, as it is shown.
 * @param copy - The full text, for a value shown truncated. Reading a hash off a screen is not an
 *   option, so copying is the only way to get one out whole.
 */
function Row({ label, value, copy }: { label: string; value: string; copy?: string }): JSX.Element {
  const { t } = useTranslate()
  const { copy: toClipboard } = useCopyToClipboard()

  return (
    <Stack
      direction='row'
      alignItems='center'
      justifyContent='space-between'
      spacing={2}
      sx={{ px: 2.5, py: 1.25 }}
    >
      <Typography variant='caption' sx={{ color: 'text.secondary', flexShrink: 0 }}>
        {label}
      </Typography>

      <Stack direction='row' alignItems='center' spacing={0.5} sx={{ minWidth: 0 }}>
        <Typography variant='body2' sx={{ textAlign: 'right', wordBreak: 'break-all' }}>
          {value}
        </Typography>
        {copy !== undefined && (
          <Tooltip title={t('staking.history.copy')}>
            <IconButton size='small' onClick={() => void toClipboard(copy)}>
              <Iconify icon='solar:copy-bold' width={14} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  )
}

// ----------------------------------------------------------------------

/**
 * One operation, in full.
 *
 * The table lists what happened; this says what it was. The transaction id lives here rather than in
 * a column because a 64-character hash is unreadable at any width a table can give it, and the only
 * thing anybody does with one is copy it or open it in an explorer — both of which need somewhere to
 * put a control.
 *
 * An unsettled operation is labelled as such here too. On Cardano a submitted transaction can still
 * be dropped, and a panel that presented one as a completed fact would be wrong in the direction
 * that costs somebody money.
 */
export default function StakingOperationDrawer({
  open,
  onClose,
  operation,
  explorerUrl
}: Props): JSX.Element | null {
  const { t } = useTranslate()

  if (operation === null) return null

  const created = operation.createdAt ? new Date(operation.createdAt) : null

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: 1, sm: 400 } } }}
    >
      <Stack sx={{ height: 1 }}>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          sx={{ px: 2.5, py: 2 }}
        >
          <Typography variant='subtitle1' data-testid='staking-operation-drawer'>
            {t(`staking.actions.${operation.kind}`, { defaultValue: operation.kind })}
          </Typography>
          <IconButton size='small' onClick={onClose} aria-label={t('staking.history.close')}>
            <Iconify icon='eva:close-fill' />
          </IconButton>
        </Stack>

        <Divider />

        <Box sx={{ py: 1 }}>
          <Row label={t('staking.history.status')} value={operation.status} />

          {!operation.settled && (
            <Stack sx={{ px: 2.5, py: 1 }}>
              <Chip
                size='small'
                variant='outlined'
                color='warning'
                label={t('staking.history.informative')}
                sx={{ alignSelf: 'flex-start', height: 20, fontSize: '0.6875rem' }}
              />
              <Typography variant='caption' sx={{ color: 'text.secondary', mt: 0.5 }}>
                {t('staking.history.informativeHint')}
              </Typography>
            </Stack>
          )}

          <Row
            label={t('staking.history.fee')}
            value={
              operation.networkFeeLovelace ? formatAdaWithUnit(operation.networkFeeLovelace) : '—'
            }
          />

          <Row
            label={t('staking.history.date')}
            value={created === null ? '—' : `${fDate(created, 'dd MMM yyyy')} ${fTime(created)}`}
          />

          {operation.txId !== null && (
            <Row
              label={t('staking.history.transaction')}
              value={`${operation.txId.slice(0, ID_PREFIX)}…`}
              copy={operation.txId}
            />
          )}
        </Box>

        {operation.txId !== null && explorerUrl !== undefined && (
          <>
            <Divider />
            <Stack sx={{ px: 2.5, py: 2 }}>
              <Link
                href={`${explorerUrl}${operation.txId}`}
                target='_blank'
                rel='noopener'
                underline='hover'
                variant='body2'
                data-testid='staking-operation-explorer'
              >
                {t('staking.history.explorer')}
              </Link>
            </Stack>
          </>
        )}
      </Stack>
    </Drawer>
  )
}
