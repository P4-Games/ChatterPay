import type { StakingView, GovernanceView } from 'src/app/api/hooks/use-staking'

// ----------------------------------------------------------------------

/**
 * A staking position, in the shape the backend really sends.
 *
 * Built from a default that is deliberately the *ordinary* case — signable, staking, abstaining, no
 * rewards — so each test only has to say what is unusual about its own case. Fictional addresses: this
 * fixture is read by tests, never by a chain.
 */
export function stakingView(overrides: Partial<StakingView> = {}): StakingView {
  return {
    walletAddress: 'addr_test1qtestwalletaddressfortestsonly000000000000000000000000000',
    rewardAddress: 'stake_test1uqtestrewardaddressfortestsonly0000000000000000',
    state: 'active',
    optedIn: true,
    optOut: null,
    termsVersion: 'v1',
    currentTermsVersion: 'v1',
    registered: true,
    registrationOrigin: 'chatterpay',
    poolId: 'pool1testpoolidfortestsonly000000000000000000000000000',
    governanceDelegation: { kind: 'always_abstain' },
    balance: {
      availability: 'complete',
      reason: null,
      economicallyUsable: true,
      utxoLovelace: '10000000',
      spendableLovelace: '10000000',
      userOwnedRefundableDepositLovelace: '2000000',
      withdrawableRewardsLovelace: '0',
      pendingRewardsLovelace: '0',
      totalAdaLovelace: '12000000',
      asOf: '2026-01-01T00:00:00.000Z'
    },
    signable: true,
    actions: {
      register_and_delegate: 'already_registered',
      delegate_vote: null,
      redelegate_pool: 'already_delegated',
      withdraw_rewards: 'no_rewards',
      deregister: null,
      exit_and_send_max: null
    },
    rewards: [],
    operations: [],
    lastSyncAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  }
}

/**
 * Governance options and history.
 *
 * @param overrides - What differs.
 * @returns The view.
 */
export function governanceView(overrides: Partial<GovernanceView> = {}): GovernanceView {
  return {
    predefined: ['always_abstain', 'always_no_confidence'],
    dreps: [],
    events: [],
    ...overrides
  }
}
