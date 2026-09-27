import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StakingActions, { StakingActionReasons } from 'src/sections/staking/staking-actions'

import { stakingView } from './fixtures'

// ----------------------------------------------------------------------

/** Every operation either layout places somewhere on the staking tab. */
const ALL_ACTIONS = ['register_and_delegate', 'withdraw_rewards', 'redelegate_pool'] as const

const renderActions = (
  props: Partial<Parameters<typeof StakingActions>[0]> = {}
): ReturnType<typeof render> =>
  render(
    <StakingActions
      staking={stakingView()}
      actions={ALL_ACTIONS}
      includeStop
      onAction={vi.fn()}
      onLeave={vi.fn()}
      {...props}
    />
  )

describe('StakingActions', () => {
  describe('what the staking tab offers', () => {
    it('offers only staking operations, never the governance or transfer ones', () => {
      // Delegating the vote belongs to the governance tab, and sending the whole balance is a
      // transfer. Both are allowed by the backend in the fixture and neither is offered here.
      renderActions()

      expect(screen.queryByTestId('staking-action-delegate_vote')).toBeNull()
      expect(screen.queryByTestId('staking-action-exit_and_send_max')).toBeNull()
      expect(screen.queryByTestId('staking-action-deregister')).toBeNull()
    })

    it('offers stopping staking only where the group asks for it', () => {
      const { unmount } = renderActions()
      expect(screen.getByTestId('staking-actions')).toContainElement(
        screen.getByTestId('staking-action-stop')
      )
      unmount()

      renderActions({ includeStop: false })
      expect(screen.queryByTestId('staking-action-stop')).toBeNull()
    })

    it('opens the stop confirmation rather than starting an operation', async () => {
      const onAction = vi.fn()
      const onLeave = vi.fn()
      renderActions({ onAction, onLeave })

      await userEvent.click(screen.getByTestId('staking-action-stop'))

      expect(onLeave).toHaveBeenCalled()
      expect(onAction).not.toHaveBeenCalled()
    })

    it('does not offer starting staking to a wallet that is already registered', () => {
      // The backend allows it in this case; the control would still describe what is already true.
      renderActions({ staking: stakingView({ actions: { register_and_delegate: null } }) })

      expect(screen.queryByTestId('staking-action-register_and_delegate')).toBeNull()
    })

    it('offers starting staking to a wallet that is not registered', () => {
      renderActions({
        staking: stakingView({ registered: false, actions: { register_and_delegate: null } })
      })

      expect(screen.getByTestId('staking-action-register_and_delegate')).toBeEnabled()
      expect(screen.queryByTestId('staking-action-stop')).toBeNull()
    })

    it('offers only the operations the group was given', () => {
      const staking = stakingView({ actions: { redelegate_pool: null } })

      const { unmount } = renderActions({ staking, actions: ['withdraw_rewards'] })
      expect(screen.queryByTestId('staking-action-redelegate_pool')).toBeNull()
      unmount()

      renderActions({ staking })
      expect(screen.getByTestId('staking-action-redelegate_pool')).toBeEnabled()
    })

    it('does not offer an action that does not apply to this wallet', () => {
      renderActions({ staking: stakingView() })

      expect(screen.queryByTestId('staking-action-redelegate_pool')).toBeNull()
    })

    it('does not render an action the backend never mentioned', () => {
      renderActions({ staking: stakingView({ actions: {} }) })

      expect(screen.queryByTestId('staking-action-withdraw_rewards')).toBeNull()
    })
  })

  describe('enabling', () => {
    it('disables an action the backend refused', () => {
      renderActions()

      expect(screen.getByTestId('staking-action-withdraw_rewards')).toBeDisabled()
    })

    it('reports which action was chosen', async () => {
      const onAction = vi.fn()
      renderActions({ staking: stakingView({ actions: { withdraw_rewards: null } }), onAction })

      await userEvent.click(screen.getByTestId('staking-action-withdraw_rewards'))

      expect(onAction).toHaveBeenCalledWith('withdraw_rewards')
    })

    it('disables everything while one action is running', () => {
      renderActions({
        staking: stakingView({ actions: { withdraw_rewards: null } }),
        busy: 'withdraw_rewards'
      })

      expect(screen.getByTestId('staking-action-withdraw_rewards')).toBeDisabled()
      expect(screen.getByTestId('staking-action-stop')).toBeDisabled()
    })

    it('keeps withdrawing available for a wallet that left', () => {
      // Leaving must never become a reason to hold on to somebody's rewards.
      renderActions({
        staking: stakingView({
          optOut: {
            at: '2026-03-15T10:00:00.000Z',
            reason: 'user_exit',
            source: 'web',
            preferenceVersion: 2
          },
          actions: { withdraw_rewards: null }
        })
      })

      expect(screen.getByTestId('staking-action-withdraw_rewards')).toBeEnabled()
      expect(screen.queryByTestId('staking-action-stop')).toBeNull()
    })

    it('offers no stop control for a wallet it cannot sign for', () => {
      renderActions({
        staking: stakingView({
          signable: false,
          actions: { withdraw_rewards: 'signer_unavailable' }
        })
      })

      expect(screen.getByTestId('staking-action-withdraw_rewards')).toBeDisabled()
      expect(screen.queryByTestId('staking-action-stop')).toBeNull()
    })
  })

  describe('the reason an action is refused', () => {
    it('is shown as text under the control rather than in a tooltip', () => {
      // A disabled button takes no pointer events, so a tooltip on it is unreachable, and a phone has
      // no hover at all.
      renderActions({
        staking: stakingView({ actions: { withdraw_rewards: 'vote_delegation_required' } })
      })

      expect(screen.getByTestId('staking-action-reason-withdraw_rewards')).toHaveTextContent(
        'staking.refusals.vote_delegation_required'
      )
    })

    it('is never folded into the label', () => {
      renderActions({
        staking: stakingView({ actions: { withdraw_rewards: 'vote_delegation_required' } })
      })

      const button = screen.getByTestId('staking-action-withdraw_rewards')

      expect(button).toHaveTextContent('staking.actions.withdraw_rewards')
      expect(button.textContent).not.toContain('staking.refusals')
    })

    it('is absent for an action that is allowed', () => {
      renderActions({ staking: stakingView({ actions: { withdraw_rewards: null } }) })

      expect(screen.queryByTestId('staking-action-reason-withdraw_rewards')).toBeNull()
    })

    it('falls back to the backend code when there is no translation for it', () => {
      renderActions({ staking: stakingView({ actions: { withdraw_rewards: 'something_new' } }) })

      expect(screen.getByTestId('staking-action-reason-withdraw_rewards')).toBeInTheDocument()
    })
  })

  describe('the compact group for a card header', () => {
    it('leaves the reason out of the header and in the card body', () => {
      const staking = stakingView({ actions: { withdraw_rewards: 'vote_delegation_required' } })
      render(
        <>
          <StakingActions
            compact
            staking={staking}
            actions={['withdraw_rewards']}
            onAction={vi.fn()}
          />
          <StakingActionReasons staking={staking} actions={['withdraw_rewards']} />
        </>
      )

      expect(screen.getByTestId('staking-actions')).not.toContainElement(
        screen.getByTestId('staking-action-reason-withdraw_rewards')
      )
      expect(screen.getByTestId('staking-action-reason-withdraw_rewards')).toHaveTextContent(
        'staking.refusals.vote_delegation_required'
      )
    })

    it('explains nothing when every offered action is allowed', () => {
      const { container } = render(
        <StakingActionReasons
          staking={stakingView({ actions: { withdraw_rewards: null } })}
          actions={['withdraw_rewards']}
        />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('the layout', () => {
    it('gives each control one button and at most one reason', () => {
      renderActions()

      const cell = screen.getByTestId('staking-actions').children[0]

      expect(cell.children).toHaveLength(2)
    })

    it('renders nothing at all when no action applies', () => {
      // An empty row in the hosting card is worse than none.
      const { container } = renderActions({
        staking: stakingView({
          signable: false,
          actions: { register_and_delegate: 'already_registered' }
        })
      })

      expect(container).toBeEmptyDOMElement()
    })
  })
})
