import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import StakingNotices from 'src/sections/staking/staking-notices'

import { stakingView } from './fixtures'

// ----------------------------------------------------------------------

/**
 * The transient conditions that constrain what can be done with the wallet.
 *
 * What this component no longer carries is the position's own state — opted out, external, activation
 * pending. That is a standing fact and it is the status card's title, where it also carries the one
 * control that changes it, so the assertions for those live in `staking-membership.test.tsx`.
 */
describe('StakingNotices', () => {
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

  it('leaves the position state to the status card', () => {
    // One decision, one home. A wallet that left is described once, where the way back is offered.
    render(
      <StakingNotices
        staking={stakingView({
          signable: false,
          optOut: {
            at: '2026-03-15T10:00:00.000Z',
            reason: 'user_exit',
            source: 'web',
            preferenceVersion: 2
          }
        })}
      />
    )

    expect(screen.queryByText('staking.notices.optedOutTitle')).toBeNull()
    expect(screen.queryByText('staking.notices.notSignableTitle')).toBeNull()
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
          registered: true,
          governanceDelegation: { kind: 'none' },
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
          },
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

    expect(screen.getByText('staking.notices.snapshotStaleTitle')).toBeInTheDocument()
    expect(screen.getByText('staking.notices.rewardsBlockedTitle')).toBeInTheDocument()
    expect(screen.getByText('staking.notices.pendingTitle')).toBeInTheDocument()
  })
})
