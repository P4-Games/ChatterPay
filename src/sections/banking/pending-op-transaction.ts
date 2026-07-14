import type { ITransaction } from 'src/types/wallet'

import type { PendingOp } from './polymarket-activity-context'

// ----------------------------------------------------------------------

/**
 * Convert a pending op into a synthetic transaction row for the history list.
 * @param {PendingOp} op - In-flight Polymarket operation.
 * @param {string} wallet - User wallet address (used as from/to depending on direction).
 * @returns {ITransaction} Synthetic transaction record.
 */
export function pendingOpToTransaction(op: PendingOp, wallet: string): ITransaction {
  const type =
    op.kind === 'claim'
      ? 'polymarket_claim'
      : op.side === 'SELL'
        ? 'polymarket_sell'
        : 'polymarket_buy'

  const status = op.status === 'processing' ? 'pending' : op.status
  // Inbound funds (sell proceeds / claim) land in the user's wallet.
  const inbound = op.kind === 'claim' || op.side === 'SELL'

  return {
    id: `pending-${op.id}`,
    trx_hash: '',
    date: op.createdAt,
    wallet_from: inbound ? '' : wallet,
    contact_from_phone: '',
    contact_from_name: null,
    contact_from_avatar_url: null,
    wallet_to: inbound ? wallet : '',
    contact_to_phone: '',
    contact_to_name: null,
    contact_to_avatar_url: null,
    token: op.token,
    amount: op.amount,
    fee: 0,
    type,
    status,
    user_notes: op.status === 'failed' ? op.error : undefined,
    polymarket_market_slug: op.marketSlug,
    polymarket_size: op.size,
    polymarket_pending_step: op.status === 'processing' ? op.step : undefined
  }
}
