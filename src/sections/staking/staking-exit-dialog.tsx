'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'

import { useTranslate } from 'src/locales'

import { formatAdaWithUnit } from './staking-amount'

// ----------------------------------------------------------------------

/** What the backend says an exit would move. Every figure in lovelace, as a string. */
export type StakingExitQuote = {
  /** The ada sitting in the wallet's own outputs. Not the user's balance: see `grossLovelace`. */
  utxoLovelace: string
  /** The registration deposit coming back. */
  refundLovelace: string
  /** What the user owns before any fee: the outputs plus the deposit. */
  grossLovelace: string
  /** What the transaction costs the chain. */
  networkFeeLovelace: string
  /** Who pays it. Always the sponsor, and shown as such so it does not read as a deduction. */
  networkFeePaidBy: 'sponsor'
  /** ChatterPay's commercial fee on the amount being sent. */
  commercialFeeLovelace: string
  /** What the destination actually receives. */
  netLovelace: string
}

type Props = {
  open: boolean
  quote: StakingExitQuote | null
  quoteLoading?: boolean
  submitting?: boolean
  error?: string | null
  onCancel: () => void
  onConfirm: (recipientAddress: string) => void
  onRecipientChange?: (recipientAddress: string) => void
}

/** Bech32 for a Cardano payment address on either network. Length is what the backend truly checks. */
const ADDRESS_PATTERN = /^(addr1|addr_test1)[0-9a-z]{20,}$/

// ----------------------------------------------------------------------

/**
 * Sending everything, with the arithmetic shown before it happens.
 *
 * This is the only screen in staking where the user cannot undo what they confirmed, so it shows the
 * whole sum rather than a single number: what they hold, what the network takes, what ChatterPay
 * takes, what the deposit gives back, and what actually lands at the destination. A single "you will
 * send X" hides which of those moved when the figure is not what somebody expected.
 *
 * The quote comes from the backend because the fee schedule lives there. Until it arrives the confirm
 * button stays disabled — offering to send everything while the amount is still being computed is how
 * a user ends up agreeing to a number nobody showed them.
 */
export default function StakingExitDialog({
  open,
  quote,
  quoteLoading = false,
  submitting = false,
  error = null,
  onCancel,
  onConfirm,
  onRecipientChange
}: Props): JSX.Element {
  const { t } = useTranslate()
  const [recipient, setRecipient] = useState('')
  const [touched, setTouched] = useState(false)

  const valid = ADDRESS_PATTERN.test(recipient.trim())
  const showError = touched && recipient.trim() !== '' && !valid

  const close = (): void => {
    setRecipient('')
    setTouched(false)
    onCancel()
  }

  const change = (value: string): void => {
    setRecipient(value)
    onRecipientChange?.(value.trim())
  }

  // Read top to bottom it has to add up, which is why the estate is its own line rather than a
  // heading: the two figures above it are what it is made of, and the two below are what comes off
  // it. The network fee is inside that list and is not subtracted, so its label says who pays.
  const rows: { key: string; label: string; value: string | undefined; strong?: boolean }[] = [
    { key: 'utxo', label: t('staking.exit.utxo'), value: quote?.utxoLovelace },
    { key: 'refund', label: t('staking.exit.refund'), value: quote?.refundLovelace },
    { key: 'gross', label: t('staking.exit.gross'), value: quote?.grossLovelace, strong: true },
    {
      key: 'networkFee',
      label:
        quote?.networkFeePaidBy === 'sponsor'
          ? t('staking.exit.networkFeeSponsored')
          : t('staking.exit.networkFee'),
      value: quote?.networkFeeLovelace
    },
    {
      key: 'commercialFee',
      label: t('staking.exit.commercialFee'),
      value: quote?.commercialFeeLovelace
    },
    { key: 'net', label: t('staking.exit.net'), value: quote?.netLovelace, strong: true }
  ]

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth='sm'>
      <DialogTitle>{t('staking.exit.title')}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            {t('staking.exit.description')}
          </Typography>

          <Alert severity='warning'>{t('staking.exit.warning')}</Alert>

          {error && <Alert severity='error'>{error}</Alert>}

          <TextField
            fullWidth
            value={recipient}
            onChange={(event) => change(event.target.value)}
            onBlur={() => setTouched(true)}
            label={t('staking.exit.recipient')}
            placeholder={t('staking.exit.recipientPlaceholder')}
            error={showError}
            helperText={showError ? t('staking.exit.recipientInvalid') : ''}
            inputProps={{ 'data-testid': 'staking-exit-recipient', spellCheck: false }}
          />

          <Divider />

          <Typography variant='subtitle2'>{t('staking.exit.quoteTitle')}</Typography>

          <Stack spacing={1}>
            {rows.map((row) => (
              <Stack
                key={row.key}
                direction='row'
                alignItems='center'
                justifyContent='space-between'
                data-testid={`staking-exit-${row.key}`}
              >
                <Typography
                  variant='body2'
                  sx={{ color: row.strong ? 'text.primary' : 'text.secondary' }}
                >
                  {row.label}
                </Typography>
                {quoteLoading || row.value === undefined ? (
                  <Skeleton width={110} />
                ) : (
                  <Typography variant={row.strong ? 'subtitle2' : 'body2'}>
                    {formatAdaWithUnit(row.value)}
                  </Typography>
                )}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={close} color='inherit' disabled={submitting}>
          {t('staking.actions.cancel')}
        </Button>
        <Button
          onClick={() => onConfirm(recipient.trim())}
          variant='contained'
          color='error'
          // No quote, no confirmation. Agreeing to send everything while the amount is still being
          // computed means agreeing to a number nobody showed.
          disabled={submitting || !valid || quote === null}
          data-testid='staking-exit-confirm'
        >
          {t('staking.actions.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
