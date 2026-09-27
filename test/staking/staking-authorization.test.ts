import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  authorizeStakingAction,
  requestStakingAction
} from 'src/app/api/services/staking/staking-service'

// ----------------------------------------------------------------------

/**
 * The server half of a staking authorisation: what the BFF sends the backend and what it makes of the
 * answer.
 *
 * Two properties are worth a test rather than a reading. The request carries an assertion signed over
 * the phone number this side resolved, which is the only thing that stops the internal token from being
 * enough to authorise somebody else's operation. And a refusal comes back as a code the screen can
 * branch on: the backend answers `security_gate` for three different situations and puts which one in
 * `data.details`, a field that does not survive the hop to the browser, so the refinement has to happen
 * here.
 *
 * Nothing reaches a backend. Axios is mocked, and no test below asserts on the contents of a secret, an
 * assertion or a grant.
 */

vi.mock('src/config-global', () => ({
  UI_BASE_URL: 'https://ui.invalid',
  BACKEND_API_URL: 'https://backend.invalid',
  BACKEND_API_TOKEN: 'a-fabricated-internal-token',
  CARDANO_STAKING_BFF_SECRET: 'a-fabricated-bff-secret-for-this-suite'
}))

vi.mock('axios', () => {
  const isAxiosError = (error: unknown): boolean =>
    typeof error === 'object' &&
    error !== null &&
    (error as { isAxiosError?: boolean }).isAxiosError === true
  return {
    default: { get: vi.fn(), post: vi.fn(), isAxiosError },
    isAxiosError
  }
})

const PHONE = '5491133334444'

/** An axios rejection shaped the way the backend's error envelope arrives. */
function backendRefusal(status: number, message: string, details?: string): unknown {
  return {
    isAxiosError: true,
    message: 'Request failed',
    response: { status, data: { status: 'error', data: { code: status, message, details } } }
  }
}

/** A successful authorisation, as the backend envelopes it. */
function backendGrant(): { data: unknown } {
  return {
    data: {
      status: 'success',
      data: {
        grant: 'an-opaque-grant',
        expiresAt: '2030-01-01T00:00:00.000Z',
        action: 'delegate_vote'
      },
      timestamp: '2030-01-01T00:00:00.000Z'
    }
  }
}

beforeEach(() => {
  vi.mocked(axios.post).mockReset()
})

describe('authorizeStakingAction', () => {
  it('returns the grant the backend issued', async () => {
    vi.mocked(axios.post).mockResolvedValue(backendGrant())

    const result = await authorizeStakingAction(PHONE, 'delegate_vote', '246810', null)

    expect(result).toMatchObject({ ok: true })
    if (!result.ok) return
    expect(result.data.action).toBe('delegate_vote')
  })

  it('signs the request over the user it resolved and the action asked for', async () => {
    vi.mocked(axios.post).mockResolvedValue(backendGrant())

    await authorizeStakingAction(PHONE, 'delegate_vote', '246810', null)

    const [, body] = vi.mocked(axios.post).mock.calls[0] as [string, Record<string, unknown>]
    expect(body.channel_user_id).toBe(PHONE)
    expect(body.action).toBe('delegate_vote')
    // Asserted as a shape, never as a value: an assertion is not something a test prints.
    expect(String(body.bff_assertion).split('.')).toHaveLength(2)
  })

  it('tells a PIN that was never set apart from the rest of the gate', async () => {
    vi.mocked(axios.post).mockRejectedValue(backendRefusal(403, 'security_gate', 'not_set'))

    await expect(
      authorizeStakingAction(PHONE, 'delegate_vote', '246810', null)
    ).resolves.toMatchObject({
      ok: false,
      status: 403,
      code: 'SECURITY_PIN_NOT_SET'
    })
  })

  it('tells a blocked PIN apart', async () => {
    vi.mocked(axios.post).mockRejectedValue(backendRefusal(403, 'security_gate', 'blocked'))

    await expect(
      authorizeStakingAction(PHONE, 'delegate_vote', '246810', null)
    ).resolves.toMatchObject({
      ok: false,
      status: 403,
      code: 'SECURITY_PIN_BLOCKED'
    })
  })

  it('tells a PIN that did not match apart', async () => {
    // `active` is the security service's word for "wrong, and there are attempts left".
    vi.mocked(axios.post).mockRejectedValue(backendRefusal(403, 'security_gate', 'active'))

    await expect(
      authorizeStakingAction(PHONE, 'delegate_vote', '246810', null)
    ).resolves.toMatchObject({
      ok: false,
      status: 403,
      code: 'SECURITY_PIN_REJECTED'
    })
  })

  it('reads the gate reasons the action endpoint reports', async () => {
    vi.mocked(axios.post).mockRejectedValue(backendRefusal(403, 'security_gate', 'pin_blocked'))

    await expect(
      authorizeStakingAction(PHONE, 'delegate_vote', '246810', null)
    ).resolves.toMatchObject({
      code: 'SECURITY_PIN_BLOCKED'
    })
  })

  it('leaves a gate refusal it cannot place as it arrived', async () => {
    // The gate could not be read. Inventing one of the three PIN situations here would tell the user to
    // do something that would not help.
    vi.mocked(axios.post).mockRejectedValue(
      backendRefusal(403, 'security_gate', 'gate_unavailable')
    )

    await expect(
      authorizeStakingAction(PHONE, 'delegate_vote', '246810', null)
    ).resolves.toMatchObject({
      code: 'security_gate'
    })
  })

  it('carries every other refusal through untouched', async () => {
    vi.mocked(axios.post).mockRejectedValue(
      backendRefusal(401, 'assertion', 'missing: no assertion presented')
    )

    await expect(
      authorizeStakingAction(PHONE, 'delegate_vote', '246810', null)
    ).resolves.toMatchObject({
      ok: false,
      status: 401,
      code: 'assertion'
    })
  })
})

describe('requestStakingAction', () => {
  it('presents the grant and signs the request as well', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: {
        status: 'success',
        data: { operationId: 'an-operation', txId: null, outcome: 'submitted' },
        timestamp: '2030-01-01T00:00:00.000Z'
      }
    })

    await requestStakingAction(PHONE, 'delegate_vote', null, 'an-opaque-grant')

    const [, body] = vi.mocked(axios.post).mock.calls[0] as [string, Record<string, unknown>]
    expect(body.pin_grant).toBe('an-opaque-grant')
    expect(String(body.bff_assertion).split('.')).toHaveLength(2)
  })

  it('refines the gate refusal here too, because the action endpoint consults it as well', async () => {
    vi.mocked(axios.post).mockRejectedValue(
      backendRefusal(403, 'security_gate', 'security_pin_setup')
    )

    await expect(requestStakingAction(PHONE, 'delegate_vote', null, null)).resolves.toMatchObject({
      ok: false,
      status: 403,
      code: 'SECURITY_PIN_NOT_SET'
    })
  })
})
