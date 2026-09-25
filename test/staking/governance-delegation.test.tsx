import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import GovernanceDelegation from 'src/sections/staking/governance-delegation'

import { stakingView, governanceView } from './fixtures'

// ----------------------------------------------------------------------

/**
 * The governance screen: what the vote is doing now, and the three alternatives.
 *
 * All three are requestable, and the press has to say which one it is — the target travels with it and
 * everything downstream, the assertion, the PIN grant and the certificate, is bound to that value. So
 * the cases below assert on what `onDelegate` is handed, not only that it fired: a button that fired
 * with the wrong target would delegate somebody's vote somewhere they did not choose.
 *
 * Two claims the screen must not make are also tested here, because both were made before and both are
 * wrong. The figure on the first card is the wallet's balance and is labelled as such, not as on-chain
 * voting power, which is a governance snapshot the backend does not report. And no representative is
 * recommended or pre-selected: the selector starts empty and the row says so in words.
 */

/** A representative, as the backend lists one: canonical identifier and nothing that ranks it. */
const DREP_ONE = 'drep1y242424242424242424242424242424242424242424242sdg97tu'
const DREP_TWO = 'drep1y2amhwamhwamhwamhwamhwamhwamhwamhwamhwamhwamhwcxwkjzd'

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

  describe('the figure on the first card', () => {
    it('shows the wallet balance', () => {
      render(
        <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
      )

      expect(screen.getByTestId('governance-power')).toHaveTextContent('12.000000 ADA')
    })

    it('labels it as the wallet balance rather than as voting power', () => {
      // The backend does not report on-chain voting power: what it sends is a balance assembled from
      // outputs, a refundable deposit and rewards. Calling that voting power would put a figure on
      // screen that the chain never agreed to.
      render(
        <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
      )

      expect(screen.getByText('governance.current.stakeLabel')).toBeInTheDocument()
      expect(screen.getByTestId('governance-power-notice')).toHaveTextContent(
        'governance.current.stakeNotice'
      )
    })

    it('shows no figure at all when the balance could not be read', () => {
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

    it('offers a control on every one of the three', () => {
      // Every row is a real request now. A row that only listed an option a user could not choose is
      // what this replaced.
      render(
        <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
      )

      expect(screen.getByTestId('governance-delegate')).toBeInTheDocument()
      expect(screen.getByTestId('governance-delegate-always_no_confidence')).toBeInTheDocument()
      expect(screen.getByTestId('governance-delegate-drep')).toBeInTheDocument()
    })

    it('hands over a vote of no confidence as its own target', async () => {
      const onDelegate = vi.fn()
      render(
        <GovernanceDelegation
          staking={stakingView()}
          governance={governanceView()}
          submitting={false}
          onDelegate={onDelegate}
        />
      )

      await userEvent.click(screen.getByTestId('governance-delegate-always_no_confidence'))

      expect(onDelegate).toHaveBeenCalledWith({ kind: 'always_no_confidence' })
    })

    it('hands over an abstention as its own target', async () => {
      // Reachable from a wallet that currently votes no confidence: the abstain row is only closed when
      // the credential already abstains.
      const onDelegate = vi.fn()
      render(
        <GovernanceDelegation
          staking={stakingView({ governanceDelegation: { kind: 'always_no_confidence' } })}
          governance={governanceView()}
          submitting={false}
          onDelegate={onDelegate}
        />
      )

      await userEvent.click(screen.getByTestId('governance-delegate'))

      expect(onDelegate).toHaveBeenCalledWith({ kind: 'always_abstain' })
    })

    it('carries the backend refusal, which applies to every row', () => {
      // The refusal is a property of the action for this wallet, not of one target, so it closes all
      // three rather than one.
      render(
        <GovernanceDelegation
          staking={stakingView({ actions: { delegate_vote: 'not_registered' } })}
          governance={governanceView({ dreps: [{ idCip129: DREP_ONE }] })}
          {...props}
        />
      )

      expect(screen.getByTestId('governance-delegate')).toBeDisabled()
      expect(screen.getByTestId('governance-delegate-always_no_confidence')).toBeDisabled()
      expect(screen.getByTestId('governance-delegate-drep')).toBeDisabled()
      expect(screen.getByTestId('governance-reason-always_abstain')).toHaveTextContent(
        'staking.refusals.not_registered'
      )
    })

    it('closes the row the credential already delegates to', () => {
      // Delegating where the vote already goes costs a network fee and changes nothing, and the backend
      // refuses it. Saying so is better than offering a transaction that does nothing.
      render(
        <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
      )

      expect(screen.getByTestId('governance-delegate')).toBeDisabled()
      expect(screen.getByTestId('governance-reason-always_abstain')).toHaveTextContent(
        'governance.options.alreadyHere'
      )
      expect(screen.getByTestId('governance-delegate-always_no_confidence')).toBeEnabled()
    })

    it('says nothing under a row that is simply available', () => {
      render(
        <GovernanceDelegation staking={stakingView()} governance={governanceView()} {...props} />
      )

      expect(screen.queryByTestId('governance-reason-always_no_confidence')).toBeNull()
    })

    it('refuses everything while an operation is being sent', () => {
      render(
        <GovernanceDelegation
          staking={stakingView({ governanceDelegation: { kind: 'none' } })}
          governance={governanceView({ dreps: [{ idCip129: DREP_ONE }] })}
          submitting
          onDelegate={vi.fn()}
        />
      )

      expect(screen.getByTestId('governance-delegate')).toBeDisabled()
      expect(screen.getByTestId('governance-delegate-always_no_confidence')).toBeDisabled()
      expect(screen.getByTestId('governance-delegate-drep')).toBeDisabled()
    })
  })

  describe('the representative row', () => {
    it('offers the representatives the backend listed', () => {
      render(
        <GovernanceDelegation
          staking={stakingView()}
          governance={governanceView({ dreps: [{ idCip129: DREP_ONE }, { idCip129: DREP_TWO }] })}
          {...props}
        />
      )

      expect(screen.getByTestId('governance-drep-select')).toBeInTheDocument()
    })

    it('recommends none of them, and says so', () => {
      // A default selection in a governance control is an opinion about how somebody else's stake should
      // vote. The row states the absence of a recommendation rather than leaving it to be inferred.
      render(
        <GovernanceDelegation
          staking={stakingView()}
          governance={governanceView({ dreps: [{ idCip129: DREP_ONE }, { idCip129: DREP_TWO }] })}
          {...props}
        />
      )

      expect(screen.getByTestId('governance-drep-notice')).toHaveTextContent(
        'governance.options.drepNotice'
      )
    })

    it('pre-selects nobody, so the row cannot be pressed until the user picks', () => {
      render(
        <GovernanceDelegation
          staking={stakingView()}
          governance={governanceView({ dreps: [{ idCip129: DREP_ONE }, { idCip129: DREP_TWO }] })}
          {...props}
        />
      )

      expect(screen.getByTestId('governance-delegate-drep')).toBeDisabled()
      expect(screen.getByTestId('governance-reason-drep')).toHaveTextContent(
        'governance.options.drepRequired'
      )
    })

    it('hands over the representative the user chose', async () => {
      // The identifier itself, not an index into a list. It is what the assertion and the grant are
      // signed over, so a row that handed over the wrong one would authorise the wrong delegation.
      const onDelegate = vi.fn()
      render(
        <GovernanceDelegation
          staking={stakingView()}
          governance={governanceView({ dreps: [{ idCip129: DREP_ONE }, { idCip129: DREP_TWO }] })}
          submitting={false}
          onDelegate={onDelegate}
        />
      )

      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(screen.getByRole('option', { name: new RegExp(DREP_TWO.slice(0, 12)) }))
      await userEvent.click(screen.getByTestId('governance-delegate-drep'))

      expect(onDelegate).toHaveBeenCalledWith({ kind: 'drep', drepId: DREP_TWO })
    })

    it('closes the row when the chosen representative is already the one followed', async () => {
      const onDelegate = vi.fn()
      render(
        <GovernanceDelegation
          staking={stakingView({ governanceDelegation: { kind: 'drep', idCip129: DREP_ONE } })}
          governance={governanceView({ dreps: [{ idCip129: DREP_ONE }, { idCip129: DREP_TWO }] })}
          submitting={false}
          onDelegate={onDelegate}
        />
      )

      await userEvent.click(screen.getByRole('combobox'))
      await userEvent.click(screen.getByRole('option', { name: new RegExp(DREP_ONE.slice(0, 12)) }))

      expect(screen.getByTestId('governance-delegate-drep')).toBeDisabled()
      expect(screen.getByTestId('governance-reason-drep')).toHaveTextContent(
        'governance.options.alreadyHere'
      )
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
              { kind: 'drep', actor: 'user', requestedAt: '2026-02-01T00:00:00.000Z' }
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
