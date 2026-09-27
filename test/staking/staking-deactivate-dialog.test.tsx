import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StakingDeactivateDialog from 'src/sections/staking/staking-deactivate-dialog'

// ----------------------------------------------------------------------

/**
 * The confirmation that stands between a user and a decision that does not reverse itself.
 *
 * Switching staking off is not the mirror image of switching it on. Joining is undone by leaving;
 * leaving is undone only by coming back to this screen and saying so, because the decision is
 * recorded and it outranks the daily pass that would otherwise enrol the wallet again as soon as it
 * holds enough ada. Somebody who leaves, receives ada later and expects to be earning on it would
 * never find out from the product that they are not.
 *
 * So the consequence belongs in the confirmation, not in a notice afterwards, and these tests hold
 * it there. They assert on translation keys rather than on sentences — the runner stubs the
 * translation layer — with the wording itself pinned separately, against the locale files.
 */
describe('StakingDeactivateDialog', () => {
  it('says that participation will not resume on its own', () => {
    render(<StakingDeactivateDialog open onCancel={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByTestId('staking-deactivate-warning')).toHaveTextContent(
      'staking.deactivate.noAutoRejoin'
    )
  })

  it('says what the deposit does', () => {
    render(<StakingDeactivateDialog open onCancel={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByText('staking.deactivate.body')).toBeInTheDocument()
  })

  it('says how to come back', () => {
    // Without this the warning is a dead end: it tells the user what they lose and not what to do
    // about it.
    render(<StakingDeactivateDialog open onCancel={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByText('staking.deactivate.howToReturn')).toBeInTheDocument()
  })

  it('offers both a way out and a way through', () => {
    render(<StakingDeactivateDialog open onCancel={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByTestId('staking-deactivate-cancel')).toBeInTheDocument()
    expect(screen.getByTestId('staking-deactivate-confirm')).toBeInTheDocument()
  })

  it('does nothing at all until the confirm button is pressed', async () => {
    const confirm = vi.fn()
    const cancel = vi.fn()
    render(<StakingDeactivateDialog open onCancel={cancel} onConfirm={confirm} />)

    await userEvent.click(screen.getByTestId('staking-deactivate-cancel'))

    expect(cancel).toHaveBeenCalledOnce()
    expect(confirm).not.toHaveBeenCalled()
  })

  it('hands the decision over once', async () => {
    const confirm = vi.fn()
    render(<StakingDeactivateDialog open onCancel={vi.fn()} onConfirm={confirm} />)

    await userEvent.click(screen.getByTestId('staking-deactivate-confirm'))

    expect(confirm).toHaveBeenCalledOnce()
  })

  it('cannot be confirmed twice while it is working', () => {
    render(<StakingDeactivateDialog open submitting onCancel={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByTestId('staking-deactivate-confirm')).toBeDisabled()
  })

  describe('rewards the ledger has not released', () => {
    it('warns about them, with the figure', () => {
      // The one loss here that coming back does not undo.
      render(
        <StakingDeactivateDialog
          open
          pendingRewardsLovelace='1500000'
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      )

      const alert = screen.getByTestId('staking-deactivate-pending')

      expect(alert).toHaveTextContent('staking.deactivate.pendingRewards')
      expect(alert.textContent).toContain('1.5')
    })

    it('says nothing when there are none', () => {
      // A warning about rewards nobody has trains people to click past the one that matters.
      render(
        <StakingDeactivateDialog
          open
          pendingRewardsLovelace='0'
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      )

      expect(screen.queryByTestId('staking-deactivate-pending')).not.toBeInTheDocument()
    })

    it('says nothing when the balance could not be read', () => {
      // Absent is not zero. A figure we could not ask for must not be reported as one we did.
      render(
        <StakingDeactivateDialog
          open
          pendingRewardsLovelace={null}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
        />
      )

      expect(screen.queryByTestId('staking-deactivate-pending')).not.toBeInTheDocument()
    })
  })
})
