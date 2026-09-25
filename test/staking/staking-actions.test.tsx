import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StakingActions from 'src/sections/staking/staking-actions'

import { stakingView } from './fixtures'

// ----------------------------------------------------------------------

describe('StakingActions', () => {
  it('enables an action the backend did not refuse', () => {
    render(<StakingActions staking={stakingView()} onAction={vi.fn()} />)

    expect(screen.getByTestId('staking-action-exit_and_send_max')).toBeEnabled()
  })

  it('does not offer to stop staking, which the status card owns', () => {
    // One entry point to the voluntary exit. Two controls for one decision is two places to keep
    // the confirmation, and one of them eventually loses it.
    render(<StakingActions staking={stakingView()} onAction={vi.fn()} />)

    expect(screen.queryByTestId('staking-action-deregister')).toBeNull()
  })

  it('does not offer an action that does not apply to this wallet', () => {
    // "Start staking — already registered" describes a state the user can already see, and a line
    // of explanation under every inapplicable control is how a card becomes a wall of text.
    render(
      <StakingActions
        staking={stakingView({ actions: { register_and_delegate: 'already_registered' } })}
        onAction={vi.fn()}
      />
    )

    expect(screen.queryByTestId('staking-action-register_and_delegate')).toBeNull()
  })

  it('disables an action the backend refused', () => {
    render(<StakingActions staking={stakingView()} onAction={vi.fn()} />)

    expect(screen.getByTestId('staking-action-withdraw_rewards')).toBeDisabled()
  })

  it('does not render an action the backend never mentioned', () => {
    // A deployment that does not offer something should not show a disabled control implying it exists.
    render(
      <StakingActions
        staking={stakingView({ actions: { withdraw_rewards: null } })}
        onAction={vi.fn()}
      />
    )

    expect(screen.queryByTestId('staking-action-exit_and_send_max')).toBeNull()
  })

  it('reports which action was chosen', async () => {
    const onAction = vi.fn()
    render(<StakingActions staking={stakingView()} onAction={onAction} />)

    await userEvent.click(screen.getByTestId('staking-action-exit_and_send_max'))

    expect(onAction).toHaveBeenCalledWith('exit_and_send_max')
  })

  it('disables everything while one action is running', () => {
    // Two staking operations cannot be live for one credential, so offering a second is offering a
    // refusal.
    render(<StakingActions staking={stakingView()} busy='withdraw_rewards' onAction={vi.fn()} />)

    expect(screen.getByTestId('staking-action-exit_and_send_max')).toBeDisabled()
    expect(screen.getByTestId('staking-action-delegate_vote')).toBeDisabled()
  })

  it('keeps the ways out available for a wallet that left', () => {
    // Leaving must never become a reason to hold on to somebody's money, so these two stay enabled
    // while the participation actions are refused.
    render(
      <StakingActions
        staking={stakingView({
          optOut: {
            at: '2026-03-15T10:00:00.000Z',
            reason: 'user_exit',
            source: 'web',
            preferenceVersion: 2
          },
          actions: {
            register_and_delegate: 'opted_out',
            delegate_vote: 'opted_out',
            withdraw_rewards: null,
            deregister: null,
            exit_and_send_max: null
          }
        })}
        onAction={vi.fn()}
      />
    )

    expect(screen.getByTestId('staking-action-withdraw_rewards')).toBeEnabled()
    expect(screen.getByTestId('staking-action-exit_and_send_max')).toBeEnabled()
    expect(screen.getByTestId('staking-action-delegate_vote')).toBeDisabled()
  })

  it('refuses everything for a wallet it cannot sign for', () => {
    render(
      <StakingActions
        staking={stakingView({
          signable: false,
          actions: {
            register_and_delegate: 'signer_unavailable',
            delegate_vote: 'signer_unavailable',
            withdraw_rewards: 'signer_unavailable',
            deregister: 'signer_unavailable',
            exit_and_send_max: 'signer_unavailable'
          }
        })}
        onAction={vi.fn()}
      />
    )

    for (const action of [
      'register_and_delegate',
      'delegate_vote',
      'withdraw_rewards',
      'exit_and_send_max'
    ]) {
      expect(screen.getByTestId(`staking-action-${action}`)).toBeDisabled()
    }
  })

  describe('the reason an action is refused', () => {
    it('is shown as text under the control rather than in a tooltip', () => {
      // A disabled button takes no pointer events, so a tooltip on it is unreachable — and on a phone
      // there is no hover at all. "Delegate your voting power first" is something a user can act on;
      // a greyed-out button is something they open a ticket about.
      render(
        <StakingActions
          staking={stakingView({ actions: { withdraw_rewards: 'vote_delegation_required' } })}
          onAction={vi.fn()}
        />
      )

      expect(screen.getByTestId('staking-action-reason-withdraw_rewards')).toHaveTextContent(
        'staking.refusals.vote_delegation_required'
      )
    })

    it('is never folded into the label', () => {
      // A label that grows with the refusal is a label that wraps to two lines in one cell and one in
      // the next, which is what makes the grid look broken.
      render(
        <StakingActions
          staking={stakingView({ actions: { withdraw_rewards: 'vote_delegation_required' } })}
          onAction={vi.fn()}
        />
      )

      const button = screen.getByTestId('staking-action-withdraw_rewards')

      expect(button).toHaveTextContent('staking.actions.withdraw_rewards')
      expect(button.textContent).not.toContain('staking.refusals')
    })

    it('is absent for an action that is allowed', () => {
      render(<StakingActions staking={stakingView()} onAction={vi.fn()} />)

      expect(screen.queryByTestId('staking-action-reason-exit_and_send_max')).toBeNull()
    })

    it('falls back to the backend code when there is no translation for it', () => {
      render(
        <StakingActions
          staking={stakingView({ actions: { withdraw_rewards: 'something_new' } })}
          onAction={vi.fn()}
        />
      )

      expect(screen.getByTestId('staking-action-reason-withdraw_rewards')).toBeInTheDocument()
    })
  })

  describe('the layout', () => {
    it('keeps what maintains a position apart from leaving with the balance', () => {
      // Separated by position and by a group label rather than by colour, which survives a
      // colourblind viewer and a greyscale screenshot.
      render(<StakingActions staking={stakingView()} onAction={vi.fn()} />)

      expect(screen.getByTestId('staking-actions-grid')).toBeInTheDocument()
      expect(screen.getByTestId('staking-actions-leaving')).toBeInTheDocument()
    })

    it('holds only the actions the backend mentioned', () => {
      render(
        <StakingActions
          staking={stakingView({ actions: { delegate_vote: null, withdraw_rewards: null } })}
          onAction={vi.fn()}
        />
      )

      expect(screen.getByTestId('staking-actions-grid').children).toHaveLength(2)
      expect(screen.queryByTestId('staking-actions-leaving')).toBeNull()
    })

    it('gives each control one button and at most one reason', () => {
      render(
        <StakingActions
          staking={stakingView({ actions: { withdraw_rewards: 'no_rewards' } })}
          onAction={vi.fn()}
        />
      )

      const cell = screen.getByTestId('staking-actions-grid').children[0]

      expect(cell.children).toHaveLength(2)
    })

    it('renders nothing at all when no action applies', () => {
      // An empty card titled "what you can do" is worse than no card.
      const { container } = render(
        <StakingActions
          staking={stakingView({ actions: { register_and_delegate: 'already_registered' } })}
          onAction={vi.fn()}
        />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })
})
