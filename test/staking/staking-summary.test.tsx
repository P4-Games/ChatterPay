import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import StakingSummary from 'src/sections/staking/staking-summary'

import { stakingView } from './fixtures'

// ----------------------------------------------------------------------

describe('StakingSummary', () => {
  it('adds the outputs, the deposit and the withdrawable rewards', () => {
    // Ten ada in outputs, two locked as the deposit, 8.183734 withdrawable. A user who staked five ada
    // and saw only their outputs would reasonably think money went missing.
    render(
      <StakingSummary
        staking={stakingView({
          balance: {
            availability: 'complete',
            reason: null,
            economicallyUsable: true,
            utxoLovelace: '10000000',
            spendableLovelace: '10000000',
            userOwnedRefundableDepositLovelace: '2000000',
            withdrawableRewardsLovelace: '8183734',
            pendingRewardsLovelace: '0',
            totalAdaLovelace: '20183734',
            asOf: '2026-01-01T00:00:00.000Z'
          }
        })}
      />
    )

    expect(screen.getByTestId('staking-total')).toHaveTextContent('20.183734 ADA')
  })

  it('does not fold pending rewards into the total', () => {
    // Not withdrawable and still liable to change. Counting them would report money the user cannot
    // touch as money they have.
    render(
      <StakingSummary
        staking={stakingView({
          balance: {
            availability: 'complete',
            reason: null,
            economicallyUsable: true,
            utxoLovelace: '10000000',
            spendableLovelace: '10000000',
            userOwnedRefundableDepositLovelace: '0',
            withdrawableRewardsLovelace: '0',
            pendingRewardsLovelace: '5000000',
            totalAdaLovelace: '10000000',
            asOf: '2026-01-01T00:00:00.000Z'
          }
        })}
      />
    )

    expect(screen.getByTestId('staking-total')).toHaveTextContent('10.000000 ADA')
    expect(screen.getByTestId('staking-pending')).toHaveTextContent('5.000000 ADA')
  })

  it('hides the pending row when there is nothing pending', () => {
    render(<StakingSummary staking={stakingView()} />)

    expect(screen.queryByTestId('staking-pending')).toBeNull()
  })

  it('shows no figure at all when the balance could not be read', () => {
    // The property the whole balance path is built around. A zero here reads as "your wallet is empty"
    // and that reading turns an outage into a wrong belief about somebody's money.
    render(
      <StakingSummary
        staking={stakingView({
          balance: {
            availability: 'unavailable',
            reason: 'provider_unavailable',
            economicallyUsable: false
          }
        })}
      />
    )

    expect(screen.queryByTestId('staking-total')).toBeNull()
    expect(screen.getByText('staking.notices.balanceUnavailableBody')).toBeInTheDocument()
  })

  it('formats an amount larger than a safe JavaScript integer exactly', () => {
    // 9_007_199_254_740_993 lovelace is past Number.MAX_SAFE_INTEGER. Dividing it as a number loses the
    // last digit silently, which is the kind of wrong that never shows up in a small fixture.
    render(
      <StakingSummary
        staking={stakingView({
          balance: {
            availability: 'complete',
            reason: null,
            economicallyUsable: true,
            utxoLovelace: '9007199254740993',
            spendableLovelace: '9007199254740993',
            userOwnedRefundableDepositLovelace: '0',
            withdrawableRewardsLovelace: '0',
            pendingRewardsLovelace: '0',
            totalAdaLovelace: '9007199254740993',
            asOf: null
          }
        })}
      />
    )

    expect(screen.getByTestId('staking-total')).toHaveTextContent('254.740993')
  })

  it('names the state it is in', () => {
    render(<StakingSummary staking={stakingView({ state: 'exit_submitted' })} />)

    expect(screen.getByText('staking.state.exit_submitted')).toBeInTheDocument()
  })
})
