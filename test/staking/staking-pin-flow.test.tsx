import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { paths } from 'src/routes/paths'

import type { StakingView } from 'src/app/api/hooks/use-staking'

import { stakingView } from './fixtures'

// ----------------------------------------------------------------------

/**
 * When the staking tab asks for the PIN.
 *
 * The rule is the one the bot applies before a transfer, as the backend reports it in `pinRequired`: a
 * user with a PIN set types it, a user without one is authorised without the dialog, and a blocked PIN
 * stops the action before any dialog opens. Every case starts from a wallet that turned staking off,
 * because turning it back on is the flow that records a consent before the registration.
 */

const state = vi.hoisted(() => ({ staking: null as StakingView | null }))

const api = vi.hoisted(() => ({
  authorizeStakingAction: vi.fn(),
  requestStakingAction: vi.fn(),
  setStakingConsent: vi.fn()
}))

vi.mock('src/routes/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('src/routes/hooks')>()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => paths.dashboard.staking.root
  }
})

vi.mock('src/auth/hooks', () => ({
  useAuthContext: () => ({ user: { wallet: '0x0000000000000000000000000000000000000001' } })
}))

vi.mock('src/app/api/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('src/app/api/hooks')>()
  return {
    ...actual,
    useGetWalletBalance: () => ({ data: { wallets: ['addr_test1qtarget'] }, isLoading: false }),
    useStakingState: () => ({
      data: { staking: state.staking },
      isLoading: false,
      error: null,
      mutate: vi.fn().mockResolvedValue(undefined)
    }),
    authorizeStakingAction: api.authorizeStakingAction,
    requestStakingAction: api.requestStakingAction,
    setStakingConsent: api.setStakingConsent
  }
})

const { default: StakingDashboardView } = await import(
  'src/sections/staking/view/staking-dashboard-view'
)

/**
 * A wallet that turned staking off and is not registered.
 *
 * @param overrides - What differs.
 * @returns The position.
 */
function optedOut(overrides: Partial<StakingView> = {}): StakingView {
  const base = stakingView()
  return stakingView({
    state: 'awaiting_consent',
    optedIn: false,
    optOut: {
      at: '2026-01-01T00:00:00.000Z',
      reason: 'user_request',
      source: 'web',
      preferenceVersion: 1
    },
    registered: false,
    poolId: null,
    actions: { ...base.actions, register_and_delegate: 'opted_out' },
    ...overrides
  })
}

beforeEach(() => {
  api.authorizeStakingAction.mockReset().mockResolvedValue({ ok: true, data: { grant: 'a-grant' } })
  api.setStakingConsent.mockReset().mockResolvedValue({ ok: true, data: {} })
  api.requestStakingAction
    .mockReset()
    .mockResolvedValue({ ok: true, data: { operationId: 'an-operation', txId: null } })
})

describe('turning staking back on', () => {
  it('authorises without a PIN when the user has none set', async () => {
    state.staking = optedOut({ pinRequired: false })
    render(<StakingDashboardView />)

    await userEvent.click(screen.getByTestId('staking-membership-reactivate'))

    await waitFor(() =>
      expect(api.authorizeStakingAction).toHaveBeenCalledWith(
        'addr_test1qtarget',
        'register_and_delegate',
        null
      )
    )
    expect(screen.queryByTestId('staking-pin-input')).toBeNull()
  })

  it('asks for the PIN when the user has one set', async () => {
    state.staking = optedOut({ pinRequired: true })
    render(<StakingDashboardView />)

    await userEvent.click(screen.getByTestId('staking-membership-reactivate'))

    expect(screen.getByTestId('staking-pin-input')).toBeInTheDocument()
    expect(api.authorizeStakingAction).not.toHaveBeenCalled()
  })

  it('asks for the PIN when the backend does not say', async () => {
    // A backend that predates `pinRequired`. Asking is the side that cannot let a PIN be skipped.
    state.staking = optedOut()
    render(<StakingDashboardView />)

    await userEvent.click(screen.getByTestId('staking-membership-reactivate'))

    expect(screen.getByTestId('staking-pin-input')).toBeInTheDocument()
  })

  it('reports a blocked PIN without opening the dialog', async () => {
    state.staking = optedOut({
      pinRequired: true,
      pinBlockedUntil: new Date(Date.now() + 60_000).toISOString()
    })
    render(<StakingDashboardView />)

    await userEvent.click(screen.getByTestId('staking-membership-reactivate'))

    expect(screen.getByTestId('staking-failure')).toHaveTextContent('staking.pin.blockedUntil')
    expect(screen.queryByTestId('staking-pin-input')).toBeNull()
    expect(api.authorizeStakingAction).not.toHaveBeenCalled()
  })

  it('reports a refused registration as staking turned on, with the reason', async () => {
    // The consent was recorded before the registration, and the sweep enrols the wallet once it
    // qualifies. An error here would say that nothing happened.
    state.staking = optedOut({ pinRequired: false })
    api.requestStakingAction.mockResolvedValue({ ok: false, message: 'sponsored_reentry_limit' })
    render(<StakingDashboardView />)

    await userEvent.click(screen.getByTestId('staking-membership-reactivate'))

    await waitFor(() =>
      expect(
        screen.getByText(
          'staking.actions.consentedNotRegistered|reason=staking.refusals.sponsored_reentry_limit'
        )
      ).toBeInTheDocument()
    )
    expect(api.setStakingConsent).toHaveBeenCalledWith('addr_test1qtarget', true)
    expect(screen.queryByTestId('staking-failure')).toBeNull()
  })
})
