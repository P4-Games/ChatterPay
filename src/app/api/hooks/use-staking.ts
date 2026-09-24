import { post, endpoints } from 'src/app/api/hooks/api-resolver'
import { getAuthorizationHeader } from 'src/auth/context/jwt/utils'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

/**
 * Reading and operating on a Cardano staking position.
 *
 * Every shape here mirrors what the backend returns, including the parts that look redundant and are
 * not. Three of them carry meaning the UI has to respect rather than flatten:
 *
 * `balance.availability` is the difference between "you have nothing" and "we could not ask". The
 * backend deliberately sends **no amounts at all** when it could not read the chain, so there is no
 * zero here to mistake for a balance. A component that reads the figures without checking availability
 * will not compile against this type, which is the point.
 *
 * `actions` is a refusal per action rather than a list of what is allowed. `null` means allowed;
 * anything else is a reason the user can be shown, and showing the reason is what turns a greyed-out
 * button into an explanation.
 *
 * `optOut` is separate from `optedIn`. A wallet that was never switched on offers to join; one that
 * left says so, and only an explicit opt-in brings it back.
 */

export type StakingActionName =
  | 'register_and_delegate'
  | 'delegate_vote'
  | 'redelegate_pool'
  | 'withdraw_rewards'
  | 'deregister'
  | 'exit_and_send_max'

export type StakingAccountState =
  | 'awaiting_consent'
  | 'awaiting_funds'
  | 'activation_pending'
  | 'signing'
  | 'submitted'
  | 'active'
  | 'exit_pending'
  | 'exit_submitted'
  | 'reconcile_required'
  | 'manual_review'

/** The amounts, in lovelace, as strings: they can exceed what a JavaScript number holds safely. */
export type StakingBalanceAmounts = {
  utxoLovelace: string
  spendableLovelace: string
  userOwnedRefundableDepositLovelace: string
  withdrawableRewardsLovelace: string
  pendingRewardsLovelace: string
  totalAdaLovelace: string
  asOf: string | null
}

export type StakingBalance =
  | ({ availability: 'complete'; reason: null; economicallyUsable: true } & StakingBalanceAmounts)
  | ({ availability: 'stale'; reason: string; economicallyUsable: false } & StakingBalanceAmounts)
  | { availability: 'unavailable'; reason: string; economicallyUsable: false }

export type StakingOptOut = {
  at: string
  reason: 'user_exit' | 'user_request' | 'operator'
  source: string
  preferenceVersion: number
}

export type StakingGovernanceDelegation = {
  kind: 'drep' | 'always_abstain' | 'always_no_confidence' | 'none' | 'not_registered'
  idCip129?: string
  idLegacy?: string | null
  drepStatus?: 'active' | 'retired' | 'unknown'
} | null

export type StakingOperationView = {
  kind: StakingActionName | string
  status: string
  chainOutcome: string
  txId: string | null
  networkFeeLovelace: string | null
  createdAt: string | null
  /** False while the chain may still change it. Such a row is shown as informative, never as final. */
  settled: boolean
}

export type StakingRewardView = {
  epoch: number
  lovelace: string
  sourceType: string | null
  observedAt: string
}

export type StakingView = {
  walletAddress: string
  rewardAddress: string
  state: StakingAccountState
  optedIn: boolean
  optOut: StakingOptOut | null
  termsVersion: string | null
  currentTermsVersion: string
  /** Whether this deployment asks the user to accept the terms before anything enrols the wallet. */
  consentRequired: boolean
  /** The balance automatic enrolment requires, in lovelace. */
  minimumEnrolmentLovelace: string
  registered: boolean
  registrationOrigin: 'unknown' | 'chatterpay' | 'external'
  poolId: string | null
  governanceDelegation: StakingGovernanceDelegation
  balance: StakingBalance
  /** Whether the backend holds the keys. False means read-only, whatever the chain would allow. */
  signable: boolean
  actions: Partial<Record<StakingActionName, string | null>>
  rewards: StakingRewardView[]
  operations: StakingOperationView[]
  lastSyncAt: string | null
}

/** What an exit would move. Every figure in lovelace, as a string. */
export type StakingExitQuote = {
  utxoLovelace: string
  refundLovelace: string
  grossLovelace: string
  networkFeeLovelace: string
  networkFeePaidBy: 'sponsor'
  commercialFeeLovelace: string
  netLovelace: string
}

export type GovernanceDRep = {
  id: string
  idCip129?: string
  status?: string
  amountLovelace?: string
}

export type GovernanceView = {
  predefined: string[]
  dreps: GovernanceDRep[]
  events: {
    kind: string
    actor: string
    requestedAt: string
    drepIdCip129?: string | null
  }[]
}

export type StakingMutationResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; message: string }

// ----------------------------------------------------------------------

/**
 * The staking position of one wallet.
 *
 * @param walletId - The wallet address. `undefined` suspends the request, which is what keeps the page
 *   from firing a call before the authenticated wallet is known.
 */
export function useStakingState(walletId?: string) {
  return useGetCommon(
    walletId ? endpoints.dashboard.wallet.staking.root(walletId) : null,
    walletId ? { headers: getAuthorizationHeader() } : {}
  ) as {
    data?: { staking: StakingView }
    isLoading: boolean
    error: unknown
    isValidating: boolean
  }
}

/**
 * Governance options and this credential's delegation history.
 *
 * @param walletId - The wallet address, or `undefined` to suspend.
 */
export function useGovernance(walletId?: string) {
  return useGetCommon(
    walletId ? endpoints.dashboard.wallet.governance(walletId) : null,
    walletId ? { headers: getAuthorizationHeader() } : {}
  ) as {
    data?: GovernanceView
    isLoading: boolean
    error: unknown
    isValidating: boolean
  }
}

/**
 * What sending everything would move, for the destination currently typed.
 *
 * Suspended until there is an address worth quoting: the backend assembles and balances a real
 * transaction to answer, so asking it once per keystroke would be several chain reads per character.
 *
 * @param walletId - The wallet.
 * @param recipientAddress - The destination, or `null` while it is incomplete.
 */
export function useStakingExitQuote(walletId?: string, recipientAddress?: string | null) {
  const ready =
    walletId !== undefined &&
    typeof recipientAddress === 'string' &&
    /^(addr1|addr_test1)[0-9a-z]{20,}$/.test(recipientAddress)

  return useGetCommon(
    ready ? endpoints.dashboard.wallet.staking.exitQuote(walletId, recipientAddress) : null,
    ready ? { headers: getAuthorizationHeader() } : {}
  ) as {
    data?: StakingExitQuote
    isLoading: boolean
    error: unknown
    isValidating: boolean
  }
}

/**
 * Records or withdraws the opt-in.
 *
 * @param walletId - The wallet.
 * @param accept - `true` to join, `false` to stop.
 * @returns What happened, with the backend's own message when it refused.
 */
export async function setStakingConsent(
  walletId: string,
  accept: boolean
): Promise<StakingMutationResult> {
  return mutate(endpoints.dashboard.wallet.staking.consent(walletId), { accept })
}

/**
 * Verifies the PIN for one action and returns a grant bound to it.
 *
 * The grant is short-lived and single-use. It is not a session: it names this action and this
 * destination, so it cannot be carried over to a different operation.
 *
 * @param walletId - The wallet.
 * @param action - What is being authorised.
 * @param pin - The user's PIN. Sent once, never stored.
 * @param recipientAddress - An exit's destination, or `null`.
 */
export async function authorizeStakingAction(
  walletId: string,
  action: StakingActionName,
  pin: string,
  recipientAddress: string | null = null
): Promise<StakingMutationResult> {
  return mutate(endpoints.dashboard.wallet.staking.authorize(walletId), {
    action,
    pin,
    recipientAddress
  })
}

/**
 * Starts an action, presenting the grant obtained for it.
 *
 * @param walletId - The wallet.
 * @param action - What to do.
 * @param options - The grant and, for an exit, where to send.
 */
export async function requestStakingAction(
  walletId: string,
  action: StakingActionName,
  options: { pinGrant?: string | null; recipientAddress?: string | null } = {}
): Promise<StakingMutationResult> {
  return mutate(endpoints.dashboard.wallet.staking.action(walletId), {
    action,
    pinGrant: options.pinGrant ?? null,
    recipientAddress: options.recipientAddress ?? null
  })
}

/**
 * Posts to a route and normalises whatever comes back.
 *
 * The backend's own refusal code is carried through rather than replaced with a generic failure: the
 * screen distinguishes "no rewards" from "we cannot sign for this wallet" from "your PIN is blocked",
 * and one message would collapse all three.
 */
async function mutate(url: string, body: Record<string, unknown>): Promise<StakingMutationResult> {
  try {
    const data = await post(url, body, { headers: getAuthorizationHeader() })
    return { ok: true, data: (data ?? {}) as Record<string, unknown> }
  } catch (error) {
    const response = (
      error as { response?: { data?: { error?: { code?: string; message?: string } } } }
    ).response
    const failure = response?.data?.error
    return { ok: false, message: failure?.code || failure?.message || 'UNKNOWN' }
  }
}
