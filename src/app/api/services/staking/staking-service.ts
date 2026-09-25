import axios from 'axios'

import { UI_BASE_URL, BACKEND_API_URL, BACKEND_API_TOKEN } from 'src/config-global'

import { signStakingAssertion } from './staking-assertion'

// ----------------------------------------------------------------------

/**
 * Cardano staking and governance, proxied to the backend.
 *
 * Two properties are load-bearing and neither is visible from the calling route alone.
 *
 * `BACKEND_API_TOKEN` is read here, in a module that only ever runs on the server. Every function
 * below is called from a route handler, never from a component, so the token has no path into a
 * bundle the browser receives.
 *
 * The phone number is never taken from the request. The route resolves it from the session cookie and
 * the wallet in the path — both of which the session validator has already checked belong to the same
 * user — and passes it here. The browser cannot name a user, and the backend resolves the credential
 * from that phone number rather than from anything in the request, so there is no parameter anywhere
 * in this path through which one person's request reaches another person's position.
 */

type BackendResponseSuccess<TData extends object> = {
  status: 'success'
  data: TData
  timestamp: string
}

type BackendResponseError = {
  status: 'error'
  data: { code: number; message: string }
  timestamp: string
}

type BackendResponse<TData extends object> = BackendResponseSuccess<TData> | BackendResponseError

export type StakingServiceResult<TData extends object> =
  | { ok: true; data: TData }
  | { ok: false; status: number; code: string; message: string }

// ----------------------------------------------------------------------

/** The actions the staking screen may ask for. Mirrors what the backend accepts. */
export const STAKING_ACTIONS = [
  'register_and_delegate',
  'delegate_vote',
  'redelegate_pool',
  'withdraw_rewards',
  'deregister',
  'exit_and_send_max'
] as const

export type StakingAction = (typeof STAKING_ACTIONS)[number]

/** The three targets a vote may be delegated to. Mirrors what the backend accepts. */
export const GOVERNANCE_TARGET_KINDS = ['always_abstain', 'always_no_confidence', 'drep'] as const

export type GovernanceTargetKind = (typeof GOVERNANCE_TARGET_KINDS)[number]

/**
 * Where a vote delegation sends the voting power.
 *
 * Tagged rather than a single string, so that "which kind of target is this" is something the caller
 * states and not something the reader infers. A predefined target carries no identifier and a
 * representative cannot be named without one, and neither mistake can be expressed in this type.
 */
export type GovernanceTarget =
  | { kind: 'always_abstain' }
  | { kind: 'always_no_confidence' }
  | { kind: 'drep'; drepId: string }

/** The one action that carries a target. Every other one refuses it. */
const GOVERNANCE_TARGETED_ACTIONS: readonly StakingAction[] = ['delegate_vote']

/**
 * The characters a representative's identifier may consist of before it is allowed into a signature.
 *
 * Not a DRep parser: the backend decides whether the identifier denotes a representative, using the
 * CIP-105/CIP-129 normaliser it already has, and refuses the request when it does not. This is a
 * delimiter guard, and it is what keeps the signed canonical form injective — the fields are joined
 * with `|`, so a field able to carry one could be chosen to make two different claim sets produce the
 * same string. Bech32 is lowercase alphanumeric; the underscore is here for the `drep_vkh` and
 * `drep_script` prefixes.
 */
const CANONICAL_ID_PATTERN = /^[a-z0-9_]{8,200}$/

/**
 * Reads a governance target out of an untrusted request body, against the action it accompanies.
 *
 * Both halves of the rule live here: the one targeted action requires a target, and every other action
 * refuses one. The backend applies the same rule to the same field and refuses independently — this is
 * not the security boundary, it is the route answering a malformed request with 400 instead of relaying
 * it.
 *
 * @param raw - Whatever the browser sent as `governanceTarget`.
 * @param action - The action the request named.
 * @returns The target, `null` when the action has none, or the reason it was refused.
 */
export function readGovernanceTarget(
  raw: unknown,
  action: StakingAction
): { ok: true; target: GovernanceTarget | null } | { ok: false; message: string } {
  const targeted = GOVERNANCE_TARGETED_ACTIONS.includes(action)
  const supplied = raw !== undefined && raw !== null

  if (!targeted) {
    return supplied
      ? {
          ok: false,
          message: `governanceTarget is only valid for: ${GOVERNANCE_TARGETED_ACTIONS.join(', ')}`
        }
      : { ok: true, target: null }
  }
  if (!supplied) return { ok: false, message: `governanceTarget is required for ${action}` }

  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, message: 'governanceTarget must be an object' }
  }

  const { kind, drepId } = raw as { kind?: unknown; drepId?: unknown }
  if (typeof kind !== 'string' || !GOVERNANCE_TARGET_KINDS.includes(kind as GovernanceTargetKind)) {
    return {
      ok: false,
      message: `governanceTarget.kind must be one of: ${GOVERNANCE_TARGET_KINDS.join(', ')}`
    }
  }
  if (kind !== 'drep') return { ok: true, target: { kind: kind as 'always_abstain' } }

  const id = typeof drepId === 'string' ? drepId.trim() : ''
  if (id === '') return { ok: false, message: 'governanceTarget.drepId is required' }
  if (!CANONICAL_ID_PATTERN.test(id)) {
    return { ok: false, message: 'governanceTarget.drepId is not a bare identifier' }
  }

  return { ok: true, target: { kind: 'drep', drepId: id } }
}

/**
 * What the assertion and the grant are bound to.
 *
 * The same string the backend builds from the same field, which is what makes the two signatures
 * comparable. A representative is bound by the identifier **as supplied**, not by its canonical
 * CIP-129 form: normalising here would mean a second DRep parser in this process, and two parsers are
 * two chances to disagree about what a representative is. Binding the literal string is tighter, not
 * looser — the same representative in another spelling is a different grant.
 *
 * @param target - The target, or `null`.
 * @returns The canonical string, or `null` when there is no target.
 */
export function governanceTargetCanonical(target: GovernanceTarget | null): string | null {
  if (target === null) return null
  return target.kind === 'drep' ? `drep:${target.drepId}` : target.kind
}

/**
 * The target as the backend's body carries it.
 *
 * @param target - The target, or `null`.
 * @returns The wire form, or `null`.
 */
function governanceTargetBody(
  target: GovernanceTarget | null
): { kind: GovernanceTargetKind; drep_id?: string } | null {
  if (target === null) return null
  return target.kind === 'drep' ? { kind: 'drep', drep_id: target.drepId } : { kind: target.kind }
}

const headers = () => ({
  Origin: UI_BASE_URL,
  Authorization: `Bearer ${BACKEND_API_TOKEN}`
})

// ----------------------------------------------------------------------

/**
 * The PIN situations the backend's `security_gate` refusal covers, as one code each.
 *
 * `security_gate` answers three situations the user resolves differently — no PIN set yet, a blocked
 * PIN, a PIN that was wrong — and the backend distinguishes them in `data.details`. That field does not
 * reach the browser, so the refinement happens here, while both halves are still in hand. A screen that
 * received one code for all three could only show one message.
 *
 * `active` is the status the security service reports for a PIN that did not match but still has
 * attempts left.
 */
const SECURITY_GATE_CODES: Record<string, string> = {
  not_set: 'SECURITY_PIN_NOT_SET',
  security_pin_setup: 'SECURITY_PIN_NOT_SET',
  blocked: 'SECURITY_PIN_BLOCKED',
  pin_blocked: 'SECURITY_PIN_BLOCKED',
  active: 'SECURITY_PIN_REJECTED',
  pin_rejected: 'SECURITY_PIN_REJECTED'
}

/**
 * Turns whatever went wrong into a result the route can answer with.
 *
 * The backend's own refusal code is carried through rather than flattened into a generic failure: the
 * screen distinguishes "you have no rewards" from "we cannot sign for this wallet" from "the security
 * gate says no", and a single error message would collapse all three into a shrug.
 */
function toFailure(error: unknown): { ok: false; status: number; code: string; message: string } {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 502
    const payload = error.response?.data as
      | { data?: { message?: string; code?: number; details?: string }; message?: string }
      | undefined
    const message = payload?.data?.message ?? payload?.message ?? error.message
    const detail = (payload?.data?.details ?? '').trim()
    const code =
      message === 'security_gate' && SECURITY_GATE_CODES[detail] !== undefined
        ? SECURITY_GATE_CODES[detail]
        : message
    return { ok: false, status, code, message }
  }
  return { ok: false, status: 500, code: 'UNKNOWN', message: 'Unexpected error' }
}

// ----------------------------------------------------------------------

export async function getStakingState(
  phoneNumber: string
): Promise<StakingServiceResult<{ staking: unknown }>> {
  try {
    const response = await axios.get<BackendResponse<{ staking: unknown }>>(
      `${BACKEND_API_URL}/cardano/staking/state`,
      { params: { channel_user_id: phoneNumber }, headers: headers() }
    )
    if (response.data.status !== 'success') {
      return { ok: false, status: 502, code: 'BACKEND_ERROR', message: response.data.data.message }
    }
    return { ok: true, data: { staking: response.data.data.staking } }
  } catch (error) {
    return toFailure(error)
  }
}

export async function setStakingConsent(
  phoneNumber: string,
  accept: boolean
): Promise<StakingServiceResult<{ optedIn: boolean; termsVersion: string | null }>> {
  try {
    const response = await axios.post<
      BackendResponse<{ optedIn: boolean; termsVersion: string | null }>
    >(
      `${BACKEND_API_URL}/cardano/staking/consent`,
      { channel_user_id: phoneNumber, accept, source: 'web' },
      { headers: headers() }
    )
    if (response.data.status !== 'success') {
      return { ok: false, status: 502, code: 'BACKEND_ERROR', message: response.data.data.message }
    }
    return { ok: true, data: response.data.data }
  } catch (error) {
    return toFailure(error)
  }
}

export async function getStakingExitQuote(
  phoneNumber: string,
  recipientAddress: string
): Promise<
  StakingServiceResult<{
    utxoLovelace: string
    refundLovelace: string
    grossLovelace: string
    networkFeeLovelace: string
    networkFeePaidBy: 'sponsor'
    commercialFeeLovelace: string
    netLovelace: string
  }>
> {
  try {
    const response = await axios.get<
      BackendResponse<{
        utxoLovelace: string
        refundLovelace: string
        grossLovelace: string
        networkFeeLovelace: string
        networkFeePaidBy: 'sponsor'
        commercialFeeLovelace: string
        netLovelace: string
      }>
    >(`${BACKEND_API_URL}/cardano/staking/exit-quote`, {
      params: { channel_user_id: phoneNumber, recipient_address: recipientAddress },
      headers: headers()
    })
    if (response.data.status !== 'success') {
      return { ok: false, status: 502, code: 'BACKEND_ERROR', message: response.data.data.message }
    }
    return { ok: true, data: response.data.data }
  } catch (error) {
    return toFailure(error)
  }
}

export async function authorizeStakingAction(
  phoneNumber: string,
  action: StakingAction,
  pin: string,
  recipientAddress: string | null,
  governanceTarget: GovernanceTarget | null = null
): Promise<
  StakingServiceResult<{
    grant: string
    expiresAt: string
    action: string
    governanceTarget: GovernanceTargetKind | null
  }>
> {
  try {
    const response = await axios.post<
      BackendResponse<{
        grant: string
        expiresAt: string
        action: string
        governanceTarget: GovernanceTargetKind | null
      }>
    >(
      `${BACKEND_API_URL}/cardano/staking/authorize`,
      {
        channel_user_id: phoneNumber,
        action,
        recipient_address: recipientAddress,
        governance_target: governanceTargetBody(governanceTarget),
        pin,
        // Signed over the phone number this route resolved from the session, not one the browser sent,
        // and over the governance target, so the grant that comes back is good for that target alone.
        bff_assertion: signStakingAssertion(
          phoneNumber,
          action,
          recipientAddress,
          governanceTargetCanonical(governanceTarget)
        )
      },
      { headers: headers() }
    )
    if (response.data.status !== 'success') {
      return { ok: false, status: 502, code: 'BACKEND_ERROR', message: response.data.data.message }
    }
    return { ok: true, data: response.data.data }
  } catch (error) {
    return toFailure(error)
  }
}

export async function requestStakingAction(
  phoneNumber: string,
  action: StakingAction,
  recipientAddress: string | null,
  pinGrant: string | null,
  governanceTarget: GovernanceTarget | null = null
): Promise<StakingServiceResult<{ operationId: string; txId: string | null; outcome: string }>> {
  try {
    const response = await axios.post<
      BackendResponse<{ operationId: string; txId: string | null; outcome: string }>
    >(
      `${BACKEND_API_URL}/cardano/staking/action`,
      {
        channel_user_id: phoneNumber,
        action,
        recipient_address: recipientAddress,
        governance_target: governanceTargetBody(governanceTarget),
        bff_assertion: signStakingAssertion(
          phoneNumber,
          action,
          recipientAddress,
          governanceTargetCanonical(governanceTarget)
        ),
        pin_grant: pinGrant
      },
      { headers: headers() }
    )
    if (response.data.status !== 'success') {
      return { ok: false, status: 502, code: 'BACKEND_ERROR', message: response.data.data.message }
    }
    return { ok: true, data: response.data.data }
  } catch (error) {
    return toFailure(error)
  }
}

export async function getGovernance(
  phoneNumber: string
): Promise<StakingServiceResult<{ predefined: string[]; dreps: unknown[]; events: unknown[] }>> {
  // The options carry whatever the chain reported about each representative and no ordering this
  // product chose. Nothing here promotes, ranks or marks one of them, because ChatterPay does not
  // recommend a representative.
  try {
    // Two reads, because the options are a property of the chain and the history is a property of the
    // user. Requested together so the page renders in one round trip.
    const [options, history] = await Promise.all([
      axios.get<BackendResponse<{ predefined: string[]; dreps: unknown[] }>>(
        `${BACKEND_API_URL}/cardano/governance/options`,
        { headers: headers() }
      ),
      axios.get<BackendResponse<{ events: unknown[] }>>(
        `${BACKEND_API_URL}/cardano/governance/history`,
        { params: { channel_user_id: phoneNumber }, headers: headers() }
      )
    ])

    if (options.data.status !== 'success') {
      return { ok: false, status: 502, code: 'BACKEND_ERROR', message: options.data.data.message }
    }

    return {
      ok: true,
      data: {
        predefined: options.data.data.predefined,
        dreps: options.data.data.dreps,
        // A user with no staking account has no history and that is not an error: the options still
        // render, and the page can offer to join.
        events: history.data.status === 'success' ? history.data.data.events : []
      }
    }
  } catch (error) {
    return toFailure(error)
  }
}
