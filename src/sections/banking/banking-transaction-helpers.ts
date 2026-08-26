import { fNumber } from 'src/utils/format-number'
import { maskAddress } from 'src/utils/format-address'

import type { ITransaction } from 'src/types/wallet'

// ----------------------------------------------------------------------

export type PolymarketSide = 'buy' | 'sell' | 'bridge' | 'claim' | 'withdraw'

const POLYMARKET_TYPE_MAP: Record<string, PolymarketSide> = {
  polymarket_buy: 'buy',
  polymarket_sell: 'sell',
  polymarket_claim: 'claim',
  // polymarket_bridge is no longer a standalone record; bridge data is embedded in polymarket_buy
  polymarket_withdraw: 'withdraw',
  polymarket_deposit: 'bridge'
}

/**
 * Whether a transaction type belongs to Polymarket.
 * @param {string} type - Raw transaction type.
 * @returns {boolean} True for `polymarket_*` types.
 */
export function isPolymarketTrx(type: string): boolean {
  return type.toLowerCase().startsWith('polymarket')
}

/**
 * Resolve the Polymarket operation side for a transaction record.
 * @param {ITransaction} data - Transaction record.
 * @returns {PolymarketSide} The mapped side, falling back to notes inspection.
 */
export function getPolymarketSide(data: ITransaction): PolymarketSide {
  const type = data.type.toLowerCase()
  const mapped = POLYMARKET_TYPE_MAP[type]
  if (mapped) return mapped

  const notes = (data.user_notes || '').toUpperCase()
  if (notes.includes('SELL')) return 'sell'
  return 'buy'
}

/**
 * Whether a transaction is incoming for the user.
 * The history aggregates every network the user operated on, and each network
 * has its own wallet address, so the check is against the whole set.
 * @param {string[]} userWallets - Every wallet address of the user.
 * @param {ITransaction} data - Transaction record.
 * @returns {boolean} True when the user is the receiving side.
 */
export function isIncomingTrx(userWallets: string[], data: ITransaction): boolean {
  return !!data.wallet_to && userWallets.includes(data.wallet_to)
}

/**
 * Derive the counterparty display data and formatted amount for a row.
 * @param {string[]} userWallets - Every wallet address of the user (one per network).
 * @param {ITransaction} data - Transaction record.
 * @param {boolean} mdUp - Desktop breakpoint flag (contact name hidden on mobile).
 * @returns {object} `contactName`, `contactIdentifier` and `calculatedAmount`.
 */
export function getContactData(
  userWallets: string[],
  data: ITransaction,
  mdUp: boolean
): { contactName: string; contactIdentifier: string; calculatedAmount: string } {
  let contactName: string = ''
  let contactIdentifier: string = ''
  let calculatedAmount: string = ''

  const trxReceive: boolean = isIncomingTrx(userWallets, data)

  if (isPolymarketTrx(data.type)) {
    contactIdentifier = ''
    calculatedAmount = fNumber(
      data.polymarket_bridge_amount !== undefined ? data.polymarket_bridge_amount : data.amount
    )
  } else if (data.type.toLowerCase() === 'swap') {
    contactName = (trxReceive ? data.contact_to_name : data.contact_from_name) || ''
    contactIdentifier = (trxReceive ? data.contact_to_phone : data.contact_from_phone) || ''
    calculatedAmount = fNumber(data.amount)
  } else {
    // 'transfer' or 'deposit'
    contactName = (trxReceive ? data.contact_from_name : data.contact_to_name) || ''
    contactIdentifier = (trxReceive ? data.contact_from_phone : data.contact_to_phone) || ''
    // `amount` is what the sender was debited; `fee` is already inside it, so `amount - fee` is
    // what landed on the other side. Each party is shown their own side of the transfer.
    //
    // This used to be the other way round — the fee subtracted when sending — which showed the
    // sender the recipient's figure and the recipient the sender's.
    calculatedAmount = fNumber(data.amount - (trxReceive ? data.fee || 0 : 0))
  }

  // case: Identifier is a wallet
  if (contactIdentifier.startsWith('0x') || contactIdentifier.startsWith('addr')) {
    contactIdentifier = maskAddress(contactIdentifier)
  }

  // hide contact name in mobile
  if (!mdUp) {
    contactName = ''
  }

  return { contactName, contactIdentifier, calculatedAmount }
}

/**
 * Turn a market slug into a readable title ("will-btc-hit" → "Will Btc Hit").
 * @param {string} [slug] - Market slug.
 * @returns {string} Humanized market name.
 */
export function formatMarketSlug(slug?: string): string {
  if (!slug) return 'Market'
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Humanize a purchase step name ("bridge_funds" → "Bridge Funds").
 * @param {string} name - Raw step name.
 * @returns {string} Readable step name.
 */
export function formatStepName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Label color for a purchase step status.
 * @param {string} s - Step status.
 * @returns {'success' | 'error' | 'warning' | 'default'} Label color.
 */
export function stepStatusColor(s: string): 'success' | 'error' | 'warning' | 'default' {
  if (s === 'completed') return 'success'
  if (s === 'failed') return 'error'
  if (s === 'pending' || s === 'in_progress') return 'warning'
  return 'default'
}

/**
 * Theme color path for a purchase step icon.
 * @param {string} s - Step status.
 * @returns {string} Theme color path (e.g. `success.main`).
 */
export function stepIconColor(s: string): string {
  if (s === 'completed' || s === 'skipped') return 'success.main'
  if (s === 'failed') return 'error.main'
  if (s === 'pending' || s === 'in_progress') return 'warning.main'
  return 'text.disabled'
}

/**
 * Iconify icon name for a purchase step status.
 * @param {string} s - Step status.
 * @returns {string} Icon name.
 */
export function stepIcon(s: string): string {
  if (s === 'completed' || s === 'skipped') return 'eva:checkmark-circle-2-fill'
  if (s === 'failed') return 'eva:close-circle-fill'
  return 'eva:clock-outline'
}
