import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StakingNotices from 'src/sections/staking/staking-notices'

import { stakingView } from './fixtures'

// ----------------------------------------------------------------------

describe('StakingNotices', () => {
  it('says so when this deployment cannot sign for the wallet', () => {
    // A wallet the user brought from elsewhere. Everything reads correctly and nothing can be started,
    // and a page that showed only disabled buttons would give no reason why.
    render(<StakingNotices staking={stakingView({ signable: false })} />)

    expect(screen.getByText('staking.notices.notSignableTitle')).toBeInTheDocument()
  })

  it('says nothing about signing when the keys are there', () => {
    render(<StakingNotices staking={stakingView()} />)

    expect(screen.queryByText('staking.notices.notSignableTitle')).toBeNull()
  })

  it('shows the opt-out with the date it was recorded', () => {
    render(
      <StakingNotices
        staking={stakingView({
          optOut: {
            at: '2026-03-15T10:00:00.000Z',
            reason: 'user_exit',
            source: 'web',
            preferenceVersion: 2
          }
        })}
      />
    )

    expect(screen.getByText(/staking\.notices\.optedOutBody/)).toBeInTheDocument()
  })

  it('offers a way back in, and only when one is given', async () => {
    const rejoin = vi.fn()
    render(
      <StakingNotices
        staking={stakingView({
          optOut: {
            at: '2026-03-15T10:00:00.000Z',
            reason: 'user_exit',
            source: 'web',
            preferenceVersion: 2
          }
        })}
        onRejoin={rejoin}
      />
    )

    await userEvent.click(screen.getByText('staking.notices.optedOutRejoin'))

    expect(rejoin).toHaveBeenCalledOnce()
  })

  it('explains that rewards are blocked until the vote is delegated', () => {
    // The Conway rule, as something a user can act on. Without this the withdrawal is simply disabled
    // and the reason lives in a ledger specification.
    render(
      <StakingNotices
        staking={stakingView({ registered: true, governanceDelegation: { kind: 'none' } })}
      />
    )

    expect(screen.getByText('staking.notices.rewardsBlockedTitle')).toBeInTheDocument()
  })

  it('does not mention the vote when it is already delegated', () => {
    render(<StakingNotices staking={stakingView()} />)

    expect(screen.queryByText('staking.notices.rewardsBlockedTitle')).toBeNull()
  })

  it('reports an unreadable balance rather than implying an empty wallet', () => {
    render(
      <StakingNotices
        staking={stakingView({
          balance: {
            availability: 'unavailable',
            reason: 'provider_unavailable',
            economicallyUsable: false
          }
        })}
      />
    )

    expect(screen.getByText('staking.notices.balanceUnavailableTitle')).toBeInTheDocument()
  })

  it('marks a stale snapshot as not current', () => {
    render(
      <StakingNotices
        staking={stakingView({
          balance: {
            availability: 'stale',
            reason: 'snapshot_stale',
            economicallyUsable: false,
            utxoLovelace: '10000000',
            spendableLovelace: '10000000',
            userOwnedRefundableDepositLovelace: '2000000',
            withdrawableRewardsLovelace: '0',
            pendingRewardsLovelace: '0',
            totalAdaLovelace: '12000000',
            asOf: '2026-01-01T00:00:00.000Z'
          }
        })}
      />
    )

    expect(screen.getByText('staking.notices.snapshotStaleTitle')).toBeInTheDocument()
  })

  it('announces an operation the chain has not settled', () => {
    render(
      <StakingNotices
        staking={stakingView({
          operations: [
            {
              kind: 'withdraw_rewards',
              status: 'submitted',
              chainOutcome: 'pending',
              txId: 'ab'.repeat(32),
              networkFeeLovelace: '180000',
              createdAt: '2026-01-01T00:00:00.000Z',
              settled: false
            }
          ]
        })}
      />
    )

    expect(screen.getByText(/staking\.notices\.pendingBody/)).toBeInTheDocument()
  })

  it('says nothing about a settled operation', () => {
    render(
      <StakingNotices
        staking={stakingView({
          operations: [
            {
              kind: 'withdraw_rewards',
              status: 'confirmed',
              chainOutcome: 'confirmed',
              txId: 'ab'.repeat(32),
              networkFeeLovelace: '180000',
              createdAt: '2026-01-01T00:00:00.000Z',
              settled: true
            }
          ]
        })}
      />
    )

    expect(screen.queryByText(/staking\.notices\.pendingBody/)).toBeNull()
  })

  it('shows several notices at once when several are true', () => {
    // They are separate alerts because collapsing them would hide whichever one the user needed.
    render(
      <StakingNotices
        staking={stakingView({
          signable: false,
          registered: true,
          governanceDelegation: { kind: 'none' },
          optOut: {
            at: '2026-03-15T10:00:00.000Z',
            reason: 'user_exit',
            source: 'web',
            preferenceVersion: 2
          }
        })}
      />
    )

    expect(screen.getByText('staking.notices.notSignableTitle')).toBeInTheDocument()
    expect(screen.getByText('staking.notices.optedOutTitle')).toBeInTheDocument()
    expect(screen.getByText('staking.notices.rewardsBlockedTitle')).toBeInTheDocument()
  })
})
