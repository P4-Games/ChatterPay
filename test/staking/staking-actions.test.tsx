import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StakingActions from 'src/sections/staking/staking-actions'

import { stakingView } from './fixtures'

// ----------------------------------------------------------------------

describe('StakingActions', () => {
  it('enables an action the backend did not refuse', () => {
    render(<StakingActions staking={stakingView()} onAction={vi.fn()} />)

    expect(screen.getByTestId('staking-action-deregister')).toBeEnabled()
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

    await userEvent.click(screen.getByTestId('staking-action-deregister'))

    expect(onAction).toHaveBeenCalledWith('deregister')
  })

  it('disables everything while one action is running', () => {
    // Two staking operations cannot be live for one credential, so offering a second is offering a
    // refusal.
    render(<StakingActions staking={stakingView()} busy='deregister' onAction={vi.fn()} />)

    expect(screen.getByTestId('staking-action-deregister')).toBeDisabled()
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
    expect(screen.getByTestId('staking-action-deregister')).toBeEnabled()
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
      'deregister',
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

      expect(screen.queryByTestId('staking-action-reason-deregister')).toBeNull()
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
    it('puts every offered action in the same grid', () => {
      // One grid rather than a column of bars: the controls are peers, and equal cells are what keeps
      // them the same width and height whatever the wallet's state.
      render(<StakingActions staking={stakingView()} onAction={vi.fn()} />)

      const grid = screen.getByTestId('staking-actions-grid')

      expect(grid.children).toHaveLength(6)
    })

    it('holds only the actions the backend mentioned', () => {
      render(
        <StakingActions
          staking={stakingView({ actions: { deregister: null, exit_and_send_max: null } })}
          onAction={vi.fn()}
        />
      )

      expect(screen.getByTestId('staking-actions-grid').children).toHaveLength(2)
    })

    it('gives each cell one control and at most one reason', () => {
      render(
        <StakingActions
          staking={stakingView({ actions: { withdraw_rewards: 'no_rewards' } })}
          onAction={vi.fn()}
        />
      )

      const cell = screen.getByTestId('staking-actions-grid').children[0]

      expect(cell.children).toHaveLength(2)
    })
  })
})
