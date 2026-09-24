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

const headers = () => ({
  Origin: UI_BASE_URL,
  Authorization: `Bearer ${BACKEND_API_TOKEN}`
})

// ----------------------------------------------------------------------

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
      | { data?: { message?: string; code?: number }; message?: string }
      | undefined
    const message = payload?.data?.message ?? payload?.message ?? error.message
    return { ok: false, status, code: message, message }
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
  recipientAddress: string | null
): Promise<StakingServiceResult<{ grant: string; expiresAt: string; action: string }>> {
  try {
    const response = await axios.post<
      BackendResponse<{ grant: string; expiresAt: string; action: string }>
    >(
      `${BACKEND_API_URL}/cardano/staking/authorize`,
      {
        channel_user_id: phoneNumber,
        action,
        recipient_address: recipientAddress,
        pin,
        // Signed over the phone number this route resolved from the session, not one the browser sent.
        bff_assertion: signStakingAssertion(phoneNumber, action, recipientAddress)
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
  pinGrant: string | null
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
        bff_assertion: signStakingAssertion(phoneNumber, action, recipientAddress),
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
