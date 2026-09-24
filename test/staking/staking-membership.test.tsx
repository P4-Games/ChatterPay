import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StakingMembership from 'src/sections/staking/staking-membership'

import { stakingView } from './fixtures'

// ----------------------------------------------------------------------

/**
 * What the screen offers, and to whom.
 *
 * Two enrolment flows exist and a deployment setting chooses between them, so the same wallet has to
 * be described two different ways. Where the terms must be accepted, joining is an act the user
 * performs. Where they need not be, enrolment is automatic: there is nothing to accept, and a card
 * offering to start would describe a step that does not exist while the sweep enrols the wallet
 * regardless of whether it was pressed.
 *
 * The case worth naming is the one that was broken: leaving used to be gated on `optedIn`, which
 * records whether somebody once switched staking on. A wallet enrolled automatically is registered,
 * delegated and earning with that flag false, so gating on it left exactly those users with a
 * position and no way out of it.
 */
describe('StakingMembership', () => {
  const noop = { onJoin: vi.fn(), onLeave: vi.fn() }

  describe('where the terms are not required', () => {
    it('offers no way to join, because joining is not a step', () => {
      const staking = stakingView({
        consentRequired: false,
        registered: false,
        optedIn: false,
        termsVersion: null,
        actions: { register_and_delegate: null }
      })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.queryByTestId('staking-consent-checkbox')).not.toBeInTheDocument()
      expect(screen.queryByTestId('staking-consent-accept')).not.toBeInTheDocument()
    })

    it('says the wallet will be picked up by the next cycle', () => {
      const staking = stakingView({
        consentRequired: false,
        registered: false,
        optedIn: false,
        actions: { register_and_delegate: null }
      })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.getByTestId('staking-membership-pending')).toHaveTextContent(
        'staking.membership.pendingTitle'
      )
    })

    it('says what the minimum is when the balance is short of it', () => {
      const staking = stakingView({
        consentRequired: false,
        registered: false,
        optedIn: false,
        minimumEnrolmentLovelace: '10000000',
        actions: { register_and_delegate: 'not_eligible' }
      })

      render(<StakingMembership staking={staking} {...noop} />)

      const card = screen.getByTestId('staking-membership-below-minimum')

      expect(card).toHaveTextContent('staking.membership.belowMinimumTitle')
      // The figure comes from the backend rather than from a constant on this side.
      expect(screen.getByText(/staking\.membership\.belowMinimumBody/).textContent).toContain('10')
    })

    it('names the reason when something other than the balance is in the way', () => {
      const staking = stakingView({
        consentRequired: false,
        registered: false,
        optedIn: false,
        actions: { register_and_delegate: 'not_allowlisted' }
      })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.getByTestId('staking-membership-blocked')).toBeInTheDocument()
      expect(screen.getByText(/staking\.refusals\.not_allowlisted/)).toBeInTheDocument()
    })
  })

  describe('a position that exists', () => {
    it('is described as active, with its pool and its deposit', () => {
      render(<StakingMembership staking={stakingView({ consentRequired: false })} {...noop} />)

      expect(screen.getByTestId('staking-membership-active')).toBeInTheDocument()
      expect(screen.getByText(/staking\.membership\.pool/)).toBeInTheDocument()
      expect(screen.getByText(/staking\.membership\.deposit/)).toBeInTheDocument()
    })

    it('offers to leave although nobody ever opted in', () => {
      // The regression this file exists for. Enrolled automatically: registered and earning, with no
      // consent and no preference on record.
      const staking = stakingView({
        consentRequired: false,
        registered: true,
        optedIn: false,
        termsVersion: null
      })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.getByTestId('staking-membership-leave')).toBeInTheDocument()
    })

    it('hands the decision over when the control is pressed', async () => {
      const onLeave = vi.fn()
      render(
        <StakingMembership
          staking={stakingView({ consentRequired: false })}
          onJoin={vi.fn()}
          onLeave={onLeave}
        />
      )

      await userEvent.click(screen.getByTestId('staking-membership-leave'))

      expect(onLeave).toHaveBeenCalledOnce()
    })

    it('offers nothing on a wallet this deployment cannot sign for', () => {
      // Registered elsewhere and readable. An exit offered here could not be carried out.
      const staking = stakingView({
        consentRequired: false,
        registered: true,
        signable: false,
        registrationOrigin: 'external'
      })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.getByTestId('staking-membership-active')).toBeInTheDocument()
      expect(screen.queryByTestId('staking-membership-leave')).not.toBeInTheDocument()
    })

    it('shows the pool and deposit of that external wallet all the same', () => {
      const staking = stakingView({ consentRequired: false, signable: false })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.getByText(/staking\.membership\.pool/)).toBeInTheDocument()
    })
  })

  describe('while the position is being unwound', () => {
    it.each([
      'exit_pending',
      'exit_submitted'
    ] as const)('says so and offers nothing in %s', (state) => {
      render(
        <StakingMembership staking={stakingView({ consentRequired: false, state })} {...noop} />
      )

      expect(screen.getByTestId('staking-membership-leaving')).toBeInTheDocument()
      expect(screen.queryByTestId('staking-membership-leave')).not.toBeInTheDocument()
      expect(screen.queryByTestId('staking-consent-accept')).not.toBeInTheDocument()
    })
  })

  describe('a wallet that left', () => {
    it('is left to the notice above, so the decision has one control', () => {
      const staking = stakingView({
        consentRequired: false,
        optOut: {
          at: '2026-01-02T00:00:00.000Z',
          reason: 'user_request',
          source: 'dashboard',
          preferenceVersion: 1
        }
      })

      const { container } = render(<StakingMembership staking={staking} {...noop} />)

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('where the terms are required', () => {
    it('keeps the acceptance flow', () => {
      const staking = stakingView({
        consentRequired: true,
        optedIn: false,
        registered: false,
        termsVersion: null
      })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.getByTestId('staking-consent-checkbox')).toBeInTheDocument()
      expect(screen.getByTestId('staking-consent-accept')).toBeInTheDocument()
    })

    it('asks again when the terms moved on', () => {
      const staking = stakingView({
        consentRequired: true,
        optedIn: true,
        termsVersion: 'v1',
        currentTermsVersion: 'v2'
      })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.getByTestId('staking-consent-checkbox')).toBeInTheDocument()
    })

    it('still describes a position that is already on chain', () => {
      const staking = stakingView({ consentRequired: true, optedIn: true, registered: true })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.getByTestId('staking-membership-active')).toBeInTheDocument()
      expect(screen.getByTestId('staking-membership-leave')).toBeInTheDocument()
    })
  })
})
