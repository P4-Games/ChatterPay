import { useState } from 'react'

import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
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
  detailsTooltip: string | null
  onOpenDetails: VoidFunction
  explorerLink: string | null
  popoverOpen: boolean
  onOpenPopover: (event: React.MouseEvent<HTMLElement>) => void
  dense?: boolean
}

/**
 * Row action buttons: purchase details, explorer link and the more-menu trigger.
 * @param {ActionsProps} props - Visibility flags and handlers; `detailsTooltip`
 * and `explorerLink` hide their button when null.
 * @returns {JSX.Element} The action button group.
 */
export function TransactionRowActions({
  detailsTooltip,
  onOpenDetails,
  explorerLink,
  popoverOpen,
  onOpenPopover,
  dense = false
}: ActionsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
      {detailsTooltip && (
        <Tooltip title={detailsTooltip}>
          <IconButton size='small' onClick={onOpenDetails}>
            <Iconify icon='eva:info-outline' />
          </IconButton>
        </Tooltip>
      )}
      {explorerLink && (
        <Tooltip title='View on Explorer'>
          <Link href={explorerLink} target='_blank' rel='noopener'>
            <IconButton size='small'>
              <Iconify icon='eva:external-link-outline' />
            </IconButton>
          </Link>
        </Tooltip>
      )}
      <IconButton
        color={popoverOpen ? 'inherit' : 'default'}
        onClick={onOpenPopover}
        size={dense ? 'small' : 'medium'}
      >
        <Iconify icon='eva:more-vertical-fill' />
      </IconButton>
    </Box>
  )
}

// ----------------------------------------------------------------------

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

  const line = (label: string, value: string, note?: string) => (
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

  const breakdown = (
    <Box sx={{ py: 0.5 }}>
      {fee > 0 && line(t('transactions.fee-chatterpay'), `${fNumber(fee)} ${row.token}`)}
      {networkFee > 0 &&
        line(
          t('transactions.fee-network'),
          `${fNumber(networkFee)} ${networkFeeToken}`,
          t('transactions.fee-network-covered')
        )}
      {attachedAda > 0 &&
        line(
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
