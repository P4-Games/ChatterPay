import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { paths } from 'src/routes/paths'

import { stakingView } from './fixtures'

// ----------------------------------------------------------------------

/**
 * Where "delegate vote" goes from the staking screen.
 *
 * Delegating needs a target, and the grant the PIN buys is signed over it — an authorisation to
 * abstain cannot be spent on a representative. The staking screen has nowhere to choose one, so
 * opening the PIN dialog there produced a request the route refused as malformed, and the user met
 * `INVALID_REQUEST_BODY` after typing their PIN. The control now leads to the screen where the target
 * is picked, which runs the same two-step flow with it.
 */

const push = vi.fn()

vi.mock('src/routes/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('src/routes/hooks')>()
  return { ...actual, useRouter: () => ({ push }), usePathname: () => paths.dashboard.staking.root }
})

vi.mock('src/auth/hooks', () => ({
  useAuthContext: () => ({ user: { wallet: '0x0000000000000000000000000000000000000001' } })
}))

const authorize = vi.fn()

vi.mock('src/app/api/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('src/app/api/hooks')>()
  return {
    ...actual,
    useGetWalletBalance: () => ({ data: { wallets: ['addr_test1qtarget'] } }),
    useStakingState: () => ({ data: { staking: stakingView() }, isLoading: false, error: null }),
    useStakingExitQuote: () => ({ data: null, isLoading: false, error: null }),
    authorizeStakingAction: authorize,
    requestStakingAction: vi.fn(),
    setStakingConsent: vi.fn()
  }
})

const { default: StakingDashboardView } = await import(
  'src/sections/staking/view/staking-dashboard-view'
)

beforeEach(() => {
  push.mockClear()
  authorize.mockClear()
})

describe('delegate vote, from the staking screen', () => {
  it('goes to governance, where the target is chosen', async () => {
    render(<StakingDashboardView />)

    await userEvent.click(screen.getByTestId('staking-action-delegate_vote'))

    expect(push).toHaveBeenCalledWith(paths.dashboard.staking.governance)
  })

  it('does not ask for the PIN, because there is nothing to authorise yet', async () => {
    // The bug this replaces: the dialog opened, took the PIN, and the request was refused for a field
    // this screen never had. A PIN spent on a request that cannot succeed is the part that matters.
    render(<StakingDashboardView />)

    await userEvent.click(screen.getByTestId('staking-action-delegate_vote'))

    expect(screen.queryByTestId('staking-pin-dialog')).toBeNull()
    expect(authorize).not.toHaveBeenCalled()
  })

  it('leaves the other actions on this screen, which can complete them', async () => {
    // The guard is one action, not a change to how the screen works: everything else still runs its
    // flow here instead of being sent somewhere else.
    render(<StakingDashboardView />)

    await userEvent.click(screen.getByTestId('staking-action-exit_and_send_max'))

    expect(push).not.toHaveBeenCalled()
  })
})
