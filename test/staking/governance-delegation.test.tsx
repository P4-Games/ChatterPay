import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import GovernanceDelegation from 'src/sections/staking/governance-delegation'

import { stakingView, governanceView } from './fixtures'

// ----------------------------------------------------------------------

/**
 * The governance screen: what the voting power is doing now, and the alternatives.
 *
 * The three options are listed because they exist on Cardano and a user choosing between them needs
 * to see them side by side. Only abstaining can be carried out from here — the action request names an
 * action and carries no governance target — so the other two say so in place of failing on press, and
 * these tests hold that distinction.
 */
describe('GovernanceDelegation', () => {
  const props = { submitting: false, onDelegate: vi.fn() }

  it('names the current delegation', () => {
    render(
      <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
    )

    expect(screen.getByTestId('governance-current')).toHaveTextContent(
      'governance.current.always_abstain'
    )
  })

  it('shows the stake that backs the vote', () => {
    render(
      <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
    )

    expect(screen.getByTestId('governance-power')).toHaveTextContent('12.000000 ADA')
  })

  it('shows no figure for the voting power when the balance could not be read', () => {
    // Absent is not zero, here as everywhere else in staking.
    render(
      <GovernanceDelegation
        staking={stakingView({
          balance: {
            availability: 'unavailable',
            reason: 'provider_unavailable',
            economicallyUsable: false
          }
        })}
        governance={governanceView()}
        {...props}
      />
    )

    expect(screen.getByTestId('governance-power')).toHaveTextContent('—')
  })

  describe('the options', () => {
    it('offers all three as rows', () => {
      render(
        <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
      )

      expect(screen.getByTestId('governance-option-always_abstain')).toBeInTheDocument()
      expect(screen.getByTestId('governance-option-always_no_confidence')).toBeInTheDocument()
      expect(screen.getByTestId('governance-option-drep')).toBeInTheDocument()
    })

    it('describes each one in a line of its own', () => {
      render(
        <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
      )

      expect(screen.getByText('governance.options.always_abstainHint')).toBeInTheDocument()
      expect(screen.getByText('governance.options.always_no_confidenceHint')).toBeInTheDocument()
      expect(screen.getByText('governance.options.drepHint')).toBeInTheDocument()
    })

    it('carries exactly one delegation control the page can act on', () => {
      // What the end-to-end suite asserts as well: the abstain row is the one wired mutation.
      render(
        <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
      )

      expect(screen.getAllByTestId('governance-delegate')).toHaveLength(1)
      expect(screen.getByTestId('governance-delegate')).toBeEnabled()
    })

    it('hands the delegation over when that control is pressed', async () => {
      const onDelegate = vi.fn()
      render(
        <GovernanceDelegation
          staking={stakingView()}
          governance={governanceView()}
          submitting={false}
          onDelegate={onDelegate}
        />
      )

      await userEvent.click(screen.getByTestId('governance-delegate'))

      expect(onDelegate).toHaveBeenCalledOnce()
    })

    it('refuses the two it cannot carry out, and says why', () => {
      render(
        <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
      )

      expect(screen.getByTestId('governance-delegate-always_no_confidence')).toBeDisabled()
      expect(screen.getByTestId('governance-delegate-drep')).toBeDisabled()
      expect(screen.getByTestId('governance-reason-always_no_confidence')).toHaveTextContent(
        'governance.options.unavailable'
      )
    })

    it('carries the backend refusal for the row it can carry out', () => {
      render(
        <GovernanceDelegation
          staking={stakingView({ actions: { delegate_vote: 'not_registered' } })}
          governance={governanceView()}
          {...props}
        />
      )

      expect(screen.getByTestId('governance-delegate')).toBeDisabled()
      expect(screen.getByTestId('governance-reason-always_abstain')).toHaveTextContent(
        'staking.refusals.not_registered'
      )
    })

    it('says nothing under the row it can carry out when nothing is in the way', () => {
      render(
        <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
      )

      expect(screen.queryByTestId('governance-reason-always_abstain')).toBeNull()
    })

    it('refuses everything while an operation is being sent', () => {
      render(
        <GovernanceDelegation
          staking={stakingView()}
          governance={governanceView()}
          submitting
          onDelegate={vi.fn()}
        />
      )

      expect(screen.getByTestId('governance-delegate')).toBeDisabled()
    })
  })

  describe('the representative row', () => {
    it('offers the representatives the backend listed', () => {
      render(
        <GovernanceDelegation
          staking={stakingView()}
          governance={governanceView({
            dreps: [{ id: 'drep1abcdefghijklmnop', idCip129: 'drep1abcdefghijklmnop' }]
          })}
          {...props}
        />
      )

      expect(screen.getByTestId('governance-drep-select')).toBeInTheDocument()
    })

    it('says so when none could be listed, instead of an empty selector', () => {
      render(
        <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
      )

      expect(screen.queryByTestId('governance-drep-select')).toBeNull()
      expect(screen.getByText('governance.options.empty')).toBeInTheDocument()
    })
  })

  describe('the history', () => {
    it('is empty until something is recorded', () => {
      render(
        <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
      )

      expect(screen.getByText('governance.history.empty')).toBeInTheDocument()
      expect(screen.queryAllByTestId('governance-history-row')).toHaveLength(0)
    })

    it('lists one row per recorded delegation', () => {
      render(
        <GovernanceDelegation
          staking={stakingView()}
          governance={governanceView({
            events: [
              { kind: 'always_abstain', actor: 'user', requestedAt: '2026-01-01T00:00:00.000Z' },
              { kind: 'always_abstain', actor: 'chain', requestedAt: '2026-02-01T00:00:00.000Z' }
            ]
          })}
          {...props}
        />
      )

      expect(screen.getAllByTestId('governance-history-row')).toHaveLength(2)
    })
  })

  it('renders without a governance read at all', () => {
    // The options come from the chain and the history from the user; a page that had neither still has
    // to describe the current delegation rather than fail.
    render(<GovernanceDelegation staking={stakingView()} governance={null} {...props} />)

    expect(screen.getByTestId('governance-current')).toBeInTheDocument()
    expect(screen.getByTestId('governance-delegate')).toBeInTheDocument()
  })
})
