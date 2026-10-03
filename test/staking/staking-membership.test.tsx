import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StakingMembership, { needsConsent } from 'src/sections/staking/staking-membership'

import { stakingView } from './fixtures'

// ----------------------------------------------------------------------

/**
 * What the screen offers, and to whom.
 *
 * Two enrolment flows exist and a deployment setting chooses between them, so the same wallet has to
 * be described two different ways. Where the terms must be accepted, joining is an act the user
 * performs. Where they need not be, there is nothing to accept: an eligible wallet is offered the
 * same single control to turn staking on now, and the copy says the sweep enrols it otherwise.
 *
 * The case worth naming is the one that was broken: leaving used to be gated on `optedIn`, which
 * records whether somebody once switched staking on. A wallet enrolled automatically is registered,
 * delegated and earning with that flag false, so gating on it left exactly those users with a
 * position and no way out of it.
 */
describe('StakingMembership', () => {
  const noop = { onJoin: vi.fn(), onLeave: vi.fn() }

  describe('where the terms are not required', () => {
    it('asks for no terms', () => {
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

    it('offers to turn staking on now, through the same flow as every other way in', async () => {
      const onJoin = vi.fn()
      const staking = stakingView({
        consentRequired: false,
        registered: false,
        optedIn: false,
        actions: { register_and_delegate: null }
      })

      render(<StakingMembership staking={staking} onJoin={onJoin} onLeave={vi.fn()} />)

      await userEvent.click(screen.getByTestId('staking-membership-activate'))

      expect(onJoin).toHaveBeenCalledOnce()
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
    it('is described as active, and identified by its pool', () => {
      render(<StakingMembership staking={stakingView({ consentRequired: false })} {...noop} />)

      expect(screen.getByTestId('staking-membership-active')).toBeInTheDocument()
      expect(screen.getByText(/staking\.membership\.pool/)).toBeInTheDocument()
    })

    it('abbreviates the pool id and offers to copy it', () => {
      // 56 characters of bech32 tell a reader nothing the ends do not, and the only use for the
      // whole string is pasting it somewhere else.
      const pool = `pool1${'q'.repeat(51)}`

      render(
        <StakingMembership
          staking={stakingView({ consentRequired: false, poolId: pool })}
          {...noop}
        />
      )

      const shown = screen.getByText(/staking\.membership\.pool/).textContent ?? ''

      expect(shown).not.toContain(pool)
      expect(shown).toContain(pool.slice(0, 10))
      expect(shown).toContain(pool.slice(-6))
      expect(screen.getByTestId('staking-membership-copy-pool')).toBeInTheDocument()
    })

    it('does not repeat the deposit the summary already states', () => {
      // One figure, one place. Two copies of an amount is something a reader has to reconcile.
      render(<StakingMembership staking={stakingView({ consentRequired: false })} {...noop} />)

      expect(screen.queryByText(/staking\.membership\.deposit/)).toBeNull()
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

    it('is named as an external wallet when this deployment cannot sign for it', () => {
      // Registered elsewhere and readable. An exit offered here could not be carried out, and the
      // state is named rather than shown as an active position with a button missing.
      const staking = stakingView({
        consentRequired: false,
        registered: true,
        signable: false,
        registrationOrigin: 'external'
      })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.getByTestId('staking-membership-external')).toBeInTheDocument()
      expect(screen.queryByTestId('staking-membership-active')).not.toBeInTheDocument()
      expect(screen.queryByTestId('staking-membership-leave')).not.toBeInTheDocument()
    })

    it('shows the pool of that external wallet all the same', () => {
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
    const left = {
      at: '2026-01-02T00:00:00.000Z',
      reason: 'user_request',
      source: 'dashboard',
      preferenceVersion: 1
    } as const

    it('is described as switched off by the user, with the date', () => {
      const staking = stakingView({ consentRequired: false, optOut: left })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.getByTestId('staking-membership-opted-out')).toHaveTextContent(
        'staking.notices.optedOutTitle'
      )
    })

    it('offers the one control that reverses it', async () => {
      // Nothing else brings the wallet back: the recorded opt-out outranks the pass that would
      // otherwise enrol it again, so the way back has to be on screen.
      const onJoin = vi.fn()
      const staking = stakingView({ consentRequired: false, optOut: left })

      render(<StakingMembership staking={staking} onJoin={onJoin} onLeave={vi.fn()} />)

      await userEvent.click(screen.getByTestId('staking-membership-reactivate'))

      expect(onJoin).toHaveBeenCalledOnce()
    })

    it('does not also offer to leave', () => {
      const staking = stakingView({ consentRequired: false, optOut: left })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.queryByTestId('staking-membership-leave')).not.toBeInTheDocument()
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
      const staking = stakingView({
        consentRequired: true,
        optedIn: true,
        registered: true
      })

      render(<StakingMembership staking={staking} {...noop} />)

      expect(screen.getByTestId('staking-membership-active')).toBeInTheDocument()
      expect(screen.getByTestId('staking-membership-leave')).toBeInTheDocument()
    })
  })
})

describe('needsConsent', () => {
  const left = {
    at: '2026-01-02T00:00:00.000Z',
    reason: 'user_request',
    source: 'dashboard',
    preferenceVersion: 1
  } as const

  it('is needed after an opt-out, even where the terms are not required', () => {
    expect(needsConsent(stakingView({ consentRequired: false, optOut: left }))).toBe(true)
  })

  it('is not needed where the terms are not required and nobody opted out', () => {
    expect(needsConsent(stakingView({ consentRequired: false, optedIn: false }))).toBe(false)
  })

  it('is needed where the terms are required and were never accepted', () => {
    expect(needsConsent(stakingView({ consentRequired: true, optedIn: false }))).toBe(true)
  })

  it('is needed where the accepted terms are an older version', () => {
    expect(
      needsConsent(
        stakingView({
          consentRequired: true,
          termsVersion: 'v1',
          currentTermsVersion: 'v2'
        })
      )
    ).toBe(true)
  })

  it('is not needed where the current terms were accepted', () => {
    expect(needsConsent(stakingView({ consentRequired: true }))).toBe(false)
  })
})
