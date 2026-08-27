import { useState } from 'react'

import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import useMediaQuery from '@mui/material/useMediaQuery'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import CircularProgress from '@mui/material/CircularProgress'
import { Link } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import Badge, { badgeClasses } from '@mui/material/Badge'

import Iconify from 'src/components/iconify'
import Avvvatars from 'avvvatars-react'

import { useTranslate } from 'src/locales'
import { fNumber } from 'src/utils/format-number'

import { isPolymarketTrx } from './banking-transaction-helpers'

import type { ITransaction } from 'src/types/wallet'

// ----------------------------------------------------------------------

export type RowBadge = {
  color: 'success' | 'error' | 'info'
  icon: React.ReactNode
}

type AvatarProps = {
  row: ITransaction
  contactName: string
  trxReceive: boolean
  isPending: boolean
  badge: RowBadge
  /** Avatar diameter — 48 on desktop rows, 40 on mobile rows. */
  size: 48 | 40
}

/**
 * Row avatar (Polymarket logo or generated contact avatar) with the status badge.
 * @param {AvatarProps} props - Row data, badge and sizing.
 * @returns {JSX.Element} The badged avatar.
 */
export function TransactionRowAvatar({
  row,
  contactName,
  trxReceive,
  isPending,
  badge,
  size
}: AvatarProps) {
  const isPolymarket = isPolymarketTrx(row.type)

  return (
    <Box sx={{ position: 'relative', mr: size === 48 ? 2 : 1.5 }}>
      <Badge
        overlap='circular'
        color={badge.color}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          isPending ? <CircularProgress size={12} sx={{ color: 'inherit' }} /> : badge.icon
        }
        sx={{
          [`& .${badgeClasses.badge}`]: {
            p: 0,
            width: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        }}
      >
        {isPolymarket ? (
          <Avatar
            src='/assets/icons/polymarket/logo.svg'
            alt='Polymarket'
            sx={{ width: size, height: size }}
          />
        ) : (
          <Avvvatars
            value={contactName || (trxReceive ? row.wallet_from : row.wallet_to || '')}
            style={contactName ? 'character' : 'shape'}
            size={size}
          />
        )}
      </Badge>
    </Box>
  )
}

// ----------------------------------------------------------------------

type ActionsProps = {
  onOpenDetails: VoidFunction
  dense?: boolean
}

/**
 * The row's one action: open the detail panel.
 *
 * It used to be four — a details button, an explorer link, and a menu holding download, print and
 * share. The menu's three did nothing at all, and the explorer link belongs with the hash it opens,
 * which is in the panel. What is left is the button that leads to all of it.
 *
 * @param {ActionsProps} props - The handler, and whether to render compactly.
 * @returns {JSX.Element} The action button.
 */
export function TransactionRowActions({ onOpenDetails, dense = false }: ActionsProps) {
  const { t } = useTranslate()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      {dense ? (
        <IconButton size='small' onClick={onOpenDetails} aria-label={t('transactions.detail-open')}>
          <Iconify icon='eva:chevron-right-fill' />
        </IconButton>
      ) : (
        <Button
          size='small'
          variant='outlined'
          color='inherit'
          onClick={onOpenDetails}
          endIcon={<Iconify icon='eva:chevron-right-fill' width={16} />}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {t('transactions.detail-open')}
        </Button>
      )}
    </Box>
  )
}

// ----------------------------------------------------------------------

/**
 * One line of the fee breakdown: a figure, and optionally what to make of it.
 *
 * At module scope because it closes over nothing — rebuilding it on every render would be work
 * spent to produce the same function, and a new identity each time defeats memoized children.
 *
 * @param {string} label - What the figure is.
 * @param {string} value - The figure, already formatted with its ticker.
 * @param {string} [note] - A clarification, shown dimmed beneath.
 * @returns {JSX.Element} The line.
 */
function feeLine(label: string, value: string, note?: string) {
  return (
    <Box sx={{ '& + &': { mt: 0.75 } }}>
      <Typography variant='caption' sx={{ display: 'block' }}>
        {label}: {value}
      </Typography>
      {note && (
        <Typography variant='caption' sx={{ display: 'block', opacity: 0.7 }}>
          {note}
        </Typography>
      )}
    </Box>
  )
}

type FeeProps = {
  row: ITransaction
  /** Compact rendering for the mobile layout, where the fee sits under the amount. */
  dense?: boolean
}

/**
 * The fee a row cost, with a breakdown behind an info affordance.
 *
 * Three different things get called "the fee" and only one of them is ours, so the headline shows
 * the ChatterPay fee and the breakdown names the rest.
 *
 * **Hover and tap are handled separately, not together.** A phone fires a synthetic `mouseenter`
 * on tap, so wiring both to the same state opens the tooltip on enter and closes it again on the
 * click that follows — a tooltip that is unreachable on exactly the devices that cannot hover. So
 * pointer devices get hover, touch devices get tap, and the keyboard gets focus.
 *
 * @param {FeeProps} props - The row, and whether to render compactly.
 * @returns {JSX.Element | null} The fee cell, or null when the row cost nothing worth naming.
 */
export function TransactionRowFee({ row, dense = false }: FeeProps) {
  const { t } = useTranslate()
  const canHover = useMediaQuery('(hover: hover)')
  const [open, setOpen] = useState(false)

  const fee = row.fee || 0
  const networkFee = row.network_fee || 0
  const attachedAda = row.attached_ada || 0
  if (fee <= 0 && networkFee <= 0 && attachedAda <= 0) return null

  const networkFeeToken = row.network_fee_token || 'ADA'

  // What actually left the sender on top of nothing: our fee, and — on a token transfer — the ADA
  // the ledger makes travel with the token. The second is not a charge and the tooltip says so, but
  // it does leave the wallet, and hiding it behind a hover is how a sender finds out only by
  // reading the transaction. Both go in the headline; the tooltip explains which is which.
  const charges = [
    ...(fee > 0 ? [`${fNumber(fee)} ${row.token}`] : []),
    ...(attachedAda > 0 ? [`${fNumber(attachedAda)} ${networkFeeToken}`] : [])
  ]

  const breakdown = (
    <Box sx={{ py: 0.5 }}>
      {fee > 0 && feeLine(t('transactions.fee-chatterpay'), `${fNumber(fee)} ${row.token}`)}
      {networkFee > 0 &&
        feeLine(
          t('transactions.fee-network'),
          `${fNumber(networkFee)} ${networkFeeToken}`,
          t('transactions.fee-network-covered')
        )}
      {attachedAda > 0 &&
        feeLine(
          t('transactions.fee-attached'),
          `${fNumber(attachedAda)} ${networkFeeToken}`,
          t('transactions.fee-attached-note')
        )}
    </Box>
  )

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box
        component='span'
        sx={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}
      >
        <Tooltip
          open={open}
          title={breakdown}
          arrow
          placement='top'
          // Every listener is off: `open` above is the only thing that moves it, and letting MUI
          // also react to pointer events would reintroduce the tap/hover collision.
          disableHoverListener
          disableFocusListener
          disableTouchListener
        >
          <ButtonBase
            onClick={canHover ? undefined : () => setOpen((value) => !value)}
            onMouseEnter={canHover ? () => setOpen(true) : undefined}
            onMouseLeave={canHover ? () => setOpen(false) : undefined}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            aria-label={t('transactions.fee-details')}
            sx={{
              gap: 0.5,
              borderRadius: 0.75,
              px: dense ? 0 : 0.5,
              py: 0.25,
              color: 'text.secondary',
              typography: dense ? 'caption' : 'body2'
            }}
          >
            {charges.length === 0 ? (
              t('transactions.fee-none')
            ) : (
              // Stacked on the narrow layout: two charges side by side overflow a phone-width cell.
              <Box
                component='span'
                sx={{
                  display: 'inline-flex',
                  flexDirection: dense ? 'column' : 'row',
                  alignItems: dense ? 'flex-end' : 'center',
                  gap: dense ? 0 : 0.5
                }}
              >
                {charges.map((charge, index) => (
                  <Box component='span' key={charge}>
                    {!dense && index > 0 ? `+ ${charge}` : charge}
                  </Box>
                ))}
              </Box>
            )}
            <Iconify icon='eva:info-outline' width={dense ? 12 : 14} sx={{ opacity: 0.6 }} />
          </ButtonBase>
        </Tooltip>
      </Box>
    </ClickAwayListener>
  )
}
