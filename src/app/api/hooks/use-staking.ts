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

/** The three targets a vote may be delegated to. */
export type GovernanceTargetKind = 'always_abstain' | 'always_no_confidence' | 'drep'

/**
 * Where a vote delegation sends the voting power.
 *
 * Tagged, and it stays tagged as far as the signature the BFF produces. A representative cannot be
 * named without an identifier and a predefined target cannot carry one, so neither mistake reaches the
 * request: the compiler refuses to express it.
 */
export type GovernanceTarget =
  | { kind: 'always_abstain' }
  | { kind: 'always_no_confidence' }
  | { kind: 'drep'; drepId: string }

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
  /**
   * Whether an authorisation asks this user for the PIN.
   *
   * Decided by the backend: false when the PIN is off in the deployment or the user has none set.
   * Absent from a backend that predates it, which is read as `true` so the PIN is still asked for.
   */
  pinRequired?: boolean
  /** When the user's PIN stops being blocked (ISO 8601), or `null` when it is not blocked. */
  pinBlockedUntil?: string | null
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

/**
 * One representative, as the backend lists it.
 *
 * `idCip129` is the identifier: canonical, and the one a delegation names. `idCip105` is the legacy
 * spelling of the same credential, carried for display beside it because explorers still print that
 * form; it is never what a request sends.
 *
 * `name` is the name the representative published in its metadata, cleaned and shortened by the
 * backend, or `null` when it published none. Anyone registering a representative chooses its name, so
 * it is shown next to the identifier and never instead of it.
 *
 * `votingPowerLovelace` is the stake delegated to that representative, when the provider reported it.
 * It is a property of the representative and says nothing about this wallet.
 *
 * The list arrives in whatever order the chain gave it. Nothing in it marks a representative as
 * recommended, because ChatterPay does not recommend one.
 */
export type GovernanceDRep = {
  idCip129: string
  idCip105?: string
  name?: string | null
  credential?: { type: 'key_hash' | 'script_hash'; hashHex: string }
  status?: 'active' | 'retired' | 'unknown'
  votingPowerLovelace?: string | null
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

/**
 * What the security service reported about a refused PIN: the attempts left after a wrong one, and
 * until when a blocked one stays blocked (ISO 8601).
 */
export type StakingPinRefusal = {
  remainingAttempts: number | null
  blockedUntil: string | null
}

export type StakingMutationResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; message: string; pin?: StakingPinRefusal }

// ----------------------------------------------------------------------

/** How often the position is read again while an operation is on its way to the chain. */
const IN_FLIGHT_REFRESH_MS = 10_000

/**
 * Whether the backend reports an operation that has not reached a final status on the chain.
 *
 * Read from the refusals rather than from `operations`: the backend refuses every action with
 * `operation_in_flight` exactly while such an operation exists, whereas an operation's `settled` flag
 * stays false for outcomes that never become final and would hold the screen in that state forever.
 *
 * @param staking - The position.
 * @returns `true` while an operation is in flight.
 */
export function hasOperationInFlight(staking: StakingView): boolean {
  return Object.values(staking.actions).some((refusal) => refusal === 'operation_in_flight')
}

/**
 * The staking position of one wallet.
 *
 * Read again periodically while an operation is in flight, so the screen follows it to confirmation
 * without the user reloading. Idle positions are not polled.
 *
 * @param walletId - The wallet address. `undefined` suspends the request, which is what keeps the page
 *   from firing a call before the authenticated wallet is known.
 */
export function useStakingState(walletId?: string) {
  return useGetCommon(
    walletId ? endpoints.dashboard.wallet.staking.root(walletId) : null,
    walletId ? { headers: getAuthorizationHeader() } : {},
    (latest?: { staking?: StakingView }) =>
      latest?.staking && hasOperationInFlight(latest.staking) ? IN_FLIGHT_REFRESH_MS : 0
  ) as {
    data?: { staking: StakingView }
    isLoading: boolean
    error: unknown
    isValidating: boolean
    /** Reads the position again. Called after anything that changes it. */
    mutate: () => Promise<unknown>
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
    /** Reads the options and the history again. Called after a delegation is sent. */
    mutate: () => Promise<unknown>
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
 * The grant is short-lived and single-use. It is not a session: it names this action, this destination
 * and, for a vote delegation, this target — so it cannot be carried over to a different operation, nor
 * spent on delegating the vote somewhere other than where the PIN was typed for.
 *
 * @param walletId - The wallet.
 * @param action - What is being authorised.
 * @param pin - The user's PIN, sent once and never stored. `null` when the position says none is
 *   required.
 * @param recipientAddress - An exit's destination, or `null`.
 * @param governanceTarget - Where a vote delegation sends the voting power. Required for
 *   `delegate_vote` and refused for every other action.
 */
export async function authorizeStakingAction(
  walletId: string,
  action: StakingActionName,
  pin: string | null,
  recipientAddress: string | null = null,
  governanceTarget: GovernanceTarget | null = null
): Promise<StakingMutationResult> {
  return mutate(endpoints.dashboard.wallet.staking.authorize(walletId), {
    action,
    pin,
    recipientAddress,
    governanceTarget
  })
}

/**
 * Starts an action, presenting the grant obtained for it.
 *
 * @param walletId - The wallet.
 * @param action - What to do.
 * @param options - The grant, for an exit where to send, and for a vote delegation what to delegate to.
 *   The target must be the same one the grant was obtained for; presenting another is refused.
 */
export async function requestStakingAction(
  walletId: string,
  action: StakingActionName,
  options: {
    pinGrant?: string | null
    recipientAddress?: string | null
    governanceTarget?: GovernanceTarget | null
  } = {}
): Promise<StakingMutationResult> {
  return mutate(endpoints.dashboard.wallet.staking.action(walletId), {
    action,
    pinGrant: options.pinGrant ?? null,
    recipientAddress: options.recipientAddress ?? null,
    governanceTarget: options.governanceTarget ?? null
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
      error as {
        response?: {
          data?: { error?: { code?: string; message?: string; pin?: StakingPinRefusal } }
        }
      }
    ).response
    const failure = response?.data?.error
    const message = failure?.code || failure?.message || 'UNKNOWN'
    return failure?.pin ? { ok: false, message, pin: failure.pin } : { ok: false, message }
  }
}
