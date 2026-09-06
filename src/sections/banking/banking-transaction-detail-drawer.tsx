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
import { useSnackbar } from 'src/components/snackbar'
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard'

import { fDate, fTime } from 'src/utils/format-time'
import { fNumber } from 'src/utils/format-number'
import { maskAddress } from 'src/utils/format-address'
import { useTranslate } from 'src/locales'
import { getTxUrl, getChainName } from 'src/config-chains'

import type { ITransaction } from 'src/types/wallet'

// ----------------------------------------------------------------------

/** Whether a string is an on-chain address rather than a phone number. */
function isAddress(value: string): boolean {
  return value.startsWith('0x') || value.startsWith('addr')
}

type RowProps = {
  label: string
  value: string
  /** Shown dimmed beneath the value: who an address belongs to, what a figure means. */
  note?: string
  /**
   * The full text to put on the clipboard.
   *
   * Present only for values shown truncated — an address, a hash. Reading those off the screen is
   * not an option, so copying is the only way to get one out whole.
   */
  copy?: string
  bold?: boolean
}

/**
 * One label/value line of the detail panel.
 *
 * At module scope: it closes over nothing, so rebuilding it per render would be work spent to get
 * the same function back.
 *
 * @param {RowProps} props - The label, the value, and what to copy.
 * @returns {JSX.Element} The line.
 */
function DetailRow({ label, value, note, copy, bold }: RowProps) {
  const { t } = useTranslate()
  const { copy: toClipboard } = useCopyToClipboard()
  const { enqueueSnackbar } = useSnackbar()

  const onCopy = () => {
    toClipboard(copy!)
    enqueueSnackbar(t('transactions.detail-copied'))
  }

  return (
    <Stack direction='row' spacing={2} justifyContent='space-between' alignItems='flex-start'>
      <Typography variant='body2' sx={{ color: 'text.secondary', flexShrink: 0 }}>
        {label}
      </Typography>

      <Box sx={{ minWidth: 0, textAlign: 'right' }}>
        <Stack direction='row' spacing={0.75} alignItems='center' justifyContent='flex-end'>
          <Typography
            variant='body2'
            sx={{
              fontWeight: bold ? 700 : 400,
              wordBreak: copy ? 'break-all' : 'normal'
            }}
          >
            {value}
          </Typography>
          {copy && (
            <Tooltip title={t('transactions.detail-copy')}>
              <IconButton size='small' onClick={onCopy} sx={{ flexShrink: 0 }}>
                <Iconify icon='eva:copy-outline' width={14} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        {note && (
          <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>
            {note}
          </Typography>
        )}
      </Box>
    </Stack>
  )
}

type SectionProps = { title: string; children: React.ReactNode }

/**
 * A titled group of lines.
 *
 * @param {SectionProps} props - The heading and its rows.
 * @returns {JSX.Element} The section.
 */
function DetailSection({ title, children }: SectionProps) {
  return (
    <Box>
      <Typography
        variant='overline'
        sx={{ color: 'text.disabled', display: 'block', mb: 1, fontSize: 11 }}
      >
        {title}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  )
}

// ----------------------------------------------------------------------

type Props = {
  open: boolean
  onClose: VoidFunction
  row: ITransaction
  /** Whether the user is the receiving side, which decides who the counterparty is. */
  trxReceive: boolean
}

/**
 * Everything known about one transaction, in a panel.
 *
 * The row can only carry four columns, and a transfer has more to it than that: which network it
 * settled on, which address it left and which it reached, and — on Cardano — three separate figures
 * that all get called "the fee" and only one of which is ours. Those used to be nowhere, or behind
 * a tooltip. This is where they live.
 *
 * @param {Props} props - The transaction and whether the panel is open.
 * @returns {JSX.Element} The drawer.
 */
export default function BankingTransactionDetailDrawer({ open, onClose, row, trxReceive }: Props) {
  const { t } = useTranslate()

  const fee = row.fee || 0
  const networkFee = row.network_fee || 0
  const attachedAda = row.attached_ada || 0
  const networkFeeToken = row.network_fee_token || 'ADA'

  // `amount` is what left the sender; the fee is already inside it. Each side is named for what it
  // actually saw, rather than both being shown one number that is only true for one of them.
  const received = row.amount - fee

  const counterparty = trxReceive ? row.contact_from_phone : row.contact_to_phone
  const counterpartyName = (trxReceive ? row.contact_from_name : row.contact_to_name) || ''
  const from = row.wallet_from
  const to = row.wallet_to || ''

  const status = (row.status || '').toLowerCase()
  const statusColor = status === 'completed' ? 'success' : status === 'failed' ? 'error' : 'warning'

  const explorerLink = getTxUrl(row.trx_hash, row.chain_id)
  const chainName = row.chain_id != null ? getChainName(row.chain_id) : ''

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
          <Typography variant='subtitle1'>{t('transactions.detail-title')}</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon='eva:close-fill' />
          </IconButton>
        </Stack>

        <Divider />

        <Stack spacing={3} sx={{ p: 2.5, overflowY: 'auto' }}>
          <Stack spacing={1} alignItems='flex-start'>
            <Chip
              size='small'
              color={statusColor}
              variant='soft'
              label={t(`transactions.status-${status}`)}
            />
            <Typography variant='h4'>
              {fNumber(row.amount)} {row.token}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {trxReceive ? t('transactions.receive-from') : t('transactions.sent-to')}{' '}
              {counterpartyName || counterparty}
            </Typography>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <DetailSection title={t('transactions.detail-network-date')}>
            {chainName && <DetailRow label={t('transactions.detail-network')} value={chainName} />}
            <DetailRow
              label={t('transactions.table-date')}
              value={`${fDate(new Date(row.date))} ${fTime(new Date(row.date))}`}
            />
            <DetailRow label={t('transactions.table-type')} value={row.type} />
          </DetailSection>

          <DetailSection title={t('transactions.detail-parties')}>
            <DetailRow
              label={t('transactions.detail-from')}
              value={isAddress(from) ? maskAddress(from) : from}
              note={
                trxReceive ? counterpartyName || undefined : t('transactions.detail-your-wallet')
              }
              copy={isAddress(from) ? from : undefined}
            />
            {to && (
              <DetailRow
                label={t('transactions.detail-to')}
                value={isAddress(to) ? maskAddress(to) : to}
                note={
                  trxReceive ? t('transactions.detail-your-wallet') : counterpartyName || undefined
                }
                copy={isAddress(to) ? to : undefined}
              />
            )}
          </DetailSection>

          <DetailSection title={t('transactions.detail-amounts')}>
            <DetailRow
              label={trxReceive ? t('transactions.detail-sent') : t('transactions.detail-you-sent')}
              value={`${fNumber(row.amount)} ${row.token}`}
            />
            {fee > 0 && (
              <DetailRow
                label={t('transactions.fee-chatterpay')}
                value={`−${fNumber(fee)} ${row.token}`}
              />
            )}
            <DetailRow
              label={
                trxReceive
                  ? t('transactions.detail-you-received')
                  : t('transactions.detail-received')
              }
              value={`${fNumber(received)} ${row.token}`}
              bold
            />
          </DetailSection>

          {(attachedAda > 0 || networkFee > 0) && (
            <DetailSection title={t('transactions.detail-ada-costs')}>
              {attachedAda > 0 && (
                <DetailRow
                  label={t('transactions.fee-attached')}
                  value={`${fNumber(attachedAda)} ${networkFeeToken}`}
                  note={t('transactions.fee-attached-note')}
                />
              )}
              {networkFee > 0 && (
                <DetailRow
                  label={t('transactions.fee-network')}
                  value={`${fNumber(networkFee)} ${networkFeeToken}`}
                  note={t('transactions.fee-network-covered')}
                />
              )}
            </DetailSection>
          )}

          {row.trx_hash && (
            <DetailSection title={t('transactions.detail-transaction')}>
              <DetailRow
                label={t('transactions.detail-hash')}
                value={maskAddress(row.trx_hash)}
                copy={row.trx_hash}
              />
            </DetailSection>
          )}

          {explorerLink && (
            <Link
              href={explorerLink}
              target='_blank'
              rel='noopener'
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                py: 1.25,
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                typography: 'body2',
                fontWeight: 600
              }}
            >
              {t('transactions.detail-explorer')}
              <Iconify icon='eva:external-link-outline' width={16} />
            </Link>
          )}
        </Stack>
      </Stack>
    </Drawer>
  )
}
