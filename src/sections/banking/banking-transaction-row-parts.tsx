import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import { Link } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import Badge, { badgeClasses } from '@mui/material/Badge'

import Iconify from 'src/components/iconify'
import Avvvatars from 'avvvatars-react'

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
