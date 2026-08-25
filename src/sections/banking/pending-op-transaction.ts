import type { ITransaction } from 'src/types/wallet'

import type { PendingOp } from './polymarket-activity-context'

// ----------------------------------------------------------------------

/**
 * Convert a pending op into a synthetic transaction row for the history list.
 * @param {PendingOp} op - In-flight Polymarket operation.
 * @param {string} wallet - User wallet address (used as from/to depending on direction).
 * @returns {ITransaction} Synthetic transaction record.
 */
/**
 * Merge optimistic (in-flight) ops on top of the real transaction history. A
 * synthetic row is dropped once its real backend counterpart shows up: by
 * purchase_id for sells, or by a matching claim/withdraw record dated after
 * the claim started.
 * @param {PendingOp[]} pendingOps - In-flight Polymarket operations.
 * @param {ITransaction[]} transactions - Real backend history.
 * @param {string} wallet - User wallet address for the synthetic rows.
 * @returns {ITransaction[]} History with synthetic rows prepended.
 */
export function mergePendingOps(
  pendingOps: PendingOp[],
  transactions: ITransaction[],
  wallet: string
): ITransaction[] {
  if (!pendingOps.length) return transactions

  const realPurchaseIds = new Set(
    transactions.flatMap((tx) => (tx.polymarket_purchase_id ? [tx.polymarket_purchase_id] : []))
  )

  const txMs = (tx: ITransaction): number => {
    const d = tx.date
    if (typeof d === 'number') return d
    const ms = new Date(d as string | Date).getTime()
    return Number.isNaN(ms) ? 0 : ms
  }

  const visibleOps = pendingOps.filter((op) => {
    if (op.purchaseId && realPurchaseIds.has(op.purchaseId)) return false
    if (op.kind === 'claim') {
      const supersededBy = transactions.some(
        (tx) =>
          (tx.type === 'polymarket_claim' || tx.type === 'polymarket_withdraw') &&
          txMs(tx) >= op.createdAt - 5000
      )
      if (supersededBy) return false
    }
    return true
  })

  if (!visibleOps.length) return transactions

  const synthetic = visibleOps
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((op) => pendingOpToTransaction(op, wallet))

  return [...synthetic, ...transactions]
}

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
