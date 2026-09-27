import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { paths } from 'src/routes/paths'

import { governanceView, stakingView } from './fixtures'

// ----------------------------------------------------------------------

/**
 * What the governance tab does once a delegation has been sent.
 *
 * The position read before the delegation still allows `delegate_vote`. Releasing the control on that
 * read lets the user send the same delegation again, typing the PIN for a request the backend refuses
 * with `operation_in_flight`. The control stays disabled until both reads come back.
 */

const reads = vi.hoisted(() => ({
  staking: vi.fn(),
  governance: vi.fn()
}))

const api = vi.hoisted(() => ({
  authorizeStakingAction: vi.fn(),
  requestStakingAction: vi.fn()
}))

vi.mock('src/routes/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('src/routes/hooks')>()
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => paths.dashboard.staking.governance
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
      data: { staking: stakingView({ pinRequired: false }) },
      isLoading: false,
      error: null,
      mutate: reads.staking
    }),
    useGovernance: () => ({ data: governanceView(), mutate: reads.governance }),
    authorizeStakingAction: api.authorizeStakingAction,
    requestStakingAction: api.requestStakingAction
  }
})

const { default: GovernanceDashboardView } = await import(
  'src/sections/staking/view/governance-dashboard-view'
)

/**
 * A promise and the function that settles it, so a test can look at the screen while a read is on its
 * way.
 */
function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve: () => void = () => undefined
  const promise = new Promise<void>((settle) => {
    resolve = settle
  })
  return { promise, resolve }
}

beforeEach(() => {
  reads.staking.mockReset().mockResolvedValue(undefined)
  reads.governance.mockReset().mockResolvedValue(undefined)
  api.authorizeStakingAction.mockReset().mockResolvedValue({ ok: true, data: { grant: 'a-grant' } })
  api.requestStakingAction
    .mockReset()
    .mockResolvedValue({ ok: true, data: { operationId: 'an-operation', txId: '7798e49ac1ff' } })
})

/** Opens the detailed layout, picks "no confidence" and sends it. */
async function delegateNoConfidence(): Promise<void> {
  await userEvent.click(within(screen.getByTestId('staking-mode')).getAllByRole('button')[1])
  await userEvent.click(screen.getByTestId('governance-option-always_no_confidence'))
  await userEvent.click(screen.getByTestId('governance-delegate'))
}

describe('after a delegation is sent', () => {
  it('reads the position and the governance history again', async () => {
    render(<GovernanceDashboardView />)

    await delegateNoConfidence()

    await waitFor(() => expect(reads.staking).toHaveBeenCalledTimes(1))
    expect(reads.governance).toHaveBeenCalledTimes(1)
  })

  it('keeps the control disabled until the position has been read again', async () => {
    const pending = deferred()
    reads.staking.mockReturnValue(pending.promise)
    render(<GovernanceDashboardView />)

    await delegateNoConfidence()

    await waitFor(() => expect(reads.staking).toHaveBeenCalled())
    expect(screen.getByTestId('governance-delegate')).toBeDisabled()

    pending.resolve()
    await waitFor(() => expect(screen.getByTestId('governance-delegate')).toBeEnabled())
  })
})
