import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { paths } from 'src/routes/paths'

import { stakingView } from './fixtures'

// ----------------------------------------------------------------------

/**
 * The staking tab offers staking operations only.
 *
 * Delegating the vote is chosen on the governance tab, where its target is picked, and sending the
 * whole balance is a transfer. The backend allows both in the fixture, and neither is offered in either
 * layout of this screen.
 */

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
    useStakingState: () => ({ data: { staking: stakingView() }, isLoading: false, error: null }),
    authorizeStakingAction: vi.fn(),
    requestStakingAction: vi.fn(),
    setStakingConsent: vi.fn()
  }
})

const { default: StakingDashboardView } = await import(
  'src/sections/staking/view/staking-dashboard-view'
)

describe('the staking tab', () => {
  it('offers no governance or transfer action in the summary layout', () => {
    render(<StakingDashboardView />)

    expect(screen.queryByTestId('staking-action-delegate_vote')).toBeNull()
    expect(screen.queryByTestId('staking-action-exit_and_send_max')).toBeNull()
  })

  it('offers no governance or transfer action in the detailed layout', async () => {
    render(<StakingDashboardView />)
    await userEvent.click(within(screen.getByTestId('staking-mode')).getAllByRole('button')[1])

    expect(screen.getByTestId('staking-details')).toBeInTheDocument()
    expect(screen.queryByTestId('staking-action-delegate_vote')).toBeNull()
    expect(screen.queryByTestId('staking-action-exit_and_send_max')).toBeNull()
  })

  it('offers stopping staking once, in the status card', () => {
    render(<StakingDashboardView />)

    expect(screen.getAllByTestId('staking-action-stop')).toHaveLength(1)
    expect(screen.queryByTestId('staking-membership-leave')).toBeNull()
  })
})
