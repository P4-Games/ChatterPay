import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StakingPinDialog, { isPinBlocked } from 'src/sections/staking/staking-pin-dialog'
import StakingExitDialog from 'src/sections/staking/staking-exit-dialog'

// ----------------------------------------------------------------------

/** A well-formed Preprod address. Fictional: nothing here reaches a chain. */
const RECIPIENT = 'addr_test1qtestrecipientaddressfortestsonly00000000000000000000000000'

/** A PIN of the default `SECURITY_PIN_LENGTH`, which this suite does not configure. */
const PIN = '246810'

/** The PIN boxes, one per digit. Password inputs have no ARIA role, so they are read from the DOM. */
function pinBoxes(): HTMLInputElement[] {
  return Array.from(screen.getByTestId('staking-pin-input').querySelectorAll('input'))
}

/**
 * Types into the first PIN box. The input moves the focus box by box, as it does for the user.
 *
 * @param digits - What to type.
 */
async function typePin(digits: string): Promise<void> {
  const [first] = pinBoxes()
  await userEvent.click(first)
  await userEvent.keyboard(digits)
}

describe('StakingPinDialog', () => {
  it('names the operation the PIN authorises', () => {
    // A dialog that says only "enter your PIN" trains people to type it whenever something asks. One
    // that names the operation gives them something to disagree with.
    render(
      <StakingPinDialog open action='exit_and_send_max' onCancel={vi.fn()} onConfirm={vi.fn()} />
    )

    expect(screen.getByText(/staking\.pin\.description/)).toHaveTextContent(
      'staking.actions.exit_and_send_max'
    )
  })

  it('asks for the PIN with the input the profile uses: one hidden box per digit', () => {
    render(
      <StakingPinDialog open action='withdraw_rewards' onCancel={vi.fn()} onConfirm={vi.fn()} />
    )

    const boxes = pinBoxes()
    expect(boxes).toHaveLength(PIN.length)
    for (const box of boxes) expect(box).toHaveAttribute('type', 'password')
  })

  it('starts empty every time it opens, including after a confirmed operation', async () => {
    // The page closes the dialog itself once an operation is sent, without going through cancel, and
    // the next action reopens the same dialog.
    const props = { action: 'withdraw_rewards' as const, onCancel: vi.fn(), onConfirm: vi.fn() }
    const { rerender } = render(<StakingPinDialog open {...props} />)

    await typePin(PIN)
    rerender(<StakingPinDialog open={false} {...props} />)
    rerender(<StakingPinDialog open {...props} />)

    await waitFor(() => {
      for (const box of pinBoxes()) expect(box).toHaveValue('')
    })
  })

  it('will not submit an empty PIN', () => {
    render(
      <StakingPinDialog open action='withdraw_rewards' onCancel={vi.fn()} onConfirm={vi.fn()} />
    )

    expect(screen.getByTestId('staking-pin-submit')).toBeDisabled()
  })

  it('will not submit a PIN shorter than the configured length', async () => {
    render(
      <StakingPinDialog open action='withdraw_rewards' onCancel={vi.fn()} onConfirm={vi.fn()} />
    )

    await typePin(PIN.slice(0, 3))

    expect(screen.getByTestId('staking-pin-submit')).toBeDisabled()
  })

  it('takes digits only', async () => {
    render(
      <StakingPinDialog open action='withdraw_rewards' onCancel={vi.fn()} onConfirm={vi.fn()} />
    )

    await typePin('ab')

    for (const box of pinBoxes()) expect(box).toHaveValue('')
  })

  it('hands the PIN over once', async () => {
    const confirm = vi.fn()
    render(
      <StakingPinDialog open action='withdraw_rewards' onCancel={vi.fn()} onConfirm={confirm} />
    )

    await typePin(PIN)
    await userEvent.click(screen.getByTestId('staking-pin-submit'))

    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1))
    expect(confirm).toHaveBeenCalledWith(PIN)
  })

  it('empties the boxes when the PIN is refused, so it is typed again rather than erased', async () => {
    const props = { action: 'withdraw_rewards' as const, onCancel: vi.fn(), onConfirm: vi.fn() }
    const { rerender } = render(<StakingPinDialog open {...props} />)

    await typePin(PIN)
    rerender(
      <StakingPinDialog
        open
        {...props}
        error={{ code: 'SECURITY_PIN_REJECTED', pin: { remainingAttempts: 2, blockedUntil: null } }}
      />
    )

    await waitFor(() => {
      for (const box of pinBoxes()) expect(box).toHaveValue('')
    })
    expect(pinBoxes()[0]).toHaveFocus()
  })

  it('shows what went wrong', () => {
    render(
      <StakingPinDialog
        open
        action='withdraw_rewards'
        error={{ code: 'SECURITY_PIN_REJECTED' }}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByText('staking.pin.rejected')).toBeInTheDocument()
  })

  // A refusal the user resolves themselves is shown as a sentence. `security_gate` on screen tells them
  // nothing they can act on, and the situations behind it are resolved differently: set a PIN, wait for
  // the block to lift, type it again.
  it.each([
    ['SECURITY_PIN_NOT_SET', 'staking.pin.notSet'],
    ['SECURITY_PIN_BLOCKED', 'staking.pin.blocked'],
    ['SECURITY_PIN_REJECTED', 'staking.pin.rejected'],
    ['SECURITY_PIN_REQUIRED', 'staking.pin.required'],
    ['security_gate', 'staking.pin.gate']
  ])('explains %s rather than showing the code', (code, key) => {
    render(
      <StakingPinDialog
        open
        action='delegate_vote'
        error={{ code }}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByText(key)).toBeInTheDocument()
    expect(screen.queryByText(code)).not.toBeInTheDocument()
  })

  it('says how many attempts are left after a wrong PIN', () => {
    render(
      <StakingPinDialog
        open
        action='withdraw_rewards'
        error={{
          code: 'SECURITY_PIN_REJECTED',
          pin: { remainingAttempts: 2, blockedUntil: null }
        }}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByText('staking.pin.rejectedAttempts|count=2')).toBeInTheDocument()
  })

  it('says until when a blocked PIN stays blocked', () => {
    render(
      <StakingPinDialog
        open
        action='withdraw_rewards'
        error={{
          code: 'SECURITY_PIN_BLOCKED',
          pin: { remainingAttempts: null, blockedUntil: '2030-01-01T00:05:00.000Z' }
        }}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByText(/^staking\.pin\.blockedUntil\|time=.+/)).toBeInTheDocument()
  })

  it('shows a refusal it cannot explain as it arrived', () => {
    // A diagnosable refusal is more use to whoever is reading it than a generic apology.
    render(
      <StakingPinDialog
        open
        action='withdraw_rewards'
        error={{ code: 'refused: rewards_blocked_by_governance' }}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByText('refused: rewards_blocked_by_governance')).toBeInTheDocument()
  })

  it('does not accept input while a submission is running', () => {
    render(
      <StakingPinDialog
        open
        submitting
        action='withdraw_rewards'
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    for (const box of pinBoxes()) expect(box).toBeDisabled()
    expect(screen.getByTestId('staking-pin-submit')).toBeDisabled()
  })
})

describe('isPinBlocked', () => {
  it('reads a block that has not lifted', () => {
    expect(isPinBlocked(new Date(Date.now() + 60_000).toISOString())).toBe(true)
  })

  it('reads an expired block, an absent one and an unreadable one as not blocked', () => {
    expect(isPinBlocked(new Date(Date.now() - 60_000).toISOString())).toBe(false)
    expect(isPinBlocked(null)).toBe(false)
    expect(isPinBlocked(undefined)).toBe(false)
    expect(isPinBlocked('not a date')).toBe(false)
  })
})

describe('StakingExitDialog', () => {
  // The figures from the wallet this was verified against on Preprod, so the arithmetic below is
  // the real one: 10000 ada in outputs, a 2 ada deposit coming back, and ChatterPay charging 0.45.
  // The network fee is in the quote and is not subtracted, because the sponsor pays it.
  const quote = {
    utxoLovelace: '10000000000',
    refundLovelace: '2000000',
    grossLovelace: '10002000000',
    networkFeeLovelace: '187853',
    networkFeePaidBy: 'sponsor' as const,
    commercialFeeLovelace: '450000',
    netLovelace: '10001550000'
  }

  it('refuses to confirm while the quote is still being computed', () => {
    // Agreeing to send everything while the amount is unknown means agreeing to a number nobody showed.
    render(
      <StakingExitDialog open quote={null} quoteLoading onCancel={vi.fn()} onConfirm={vi.fn()} />
    )

    expect(screen.getByTestId('staking-exit-confirm')).toBeDisabled()
  })

  it('shows the whole sum rather than one number', () => {
    render(<StakingExitDialog open quote={quote} onCancel={vi.fn()} onConfirm={vi.fn()} />)

    // Read top to bottom this has to add up, and the line that used to be missing is the total.
    // Showing the outputs alone as the balance understates what the user owns by the deposit, and
    // then the amount the address receives looks larger than the balance it came out of.
    //
    // Compared by digits: grouping and the decimal separator follow the browser's locale, and this
    // assertion is about which figure lands in which row. The formatting has its own tests.
    const digits = (id: string): string =>
      (screen.getByTestId(id).textContent ?? '').replace(/\D/g, '')

    expect(digits('staking-exit-utxo')).toBe('10000000000')
    expect(digits('staking-exit-refund')).toBe('2000000')
    expect(digits('staking-exit-gross')).toBe('10002000000')
    expect(digits('staking-exit-commercialFee')).toBe('0450000')
    expect(digits('staking-exit-net')).toBe('10001550000')
  })

  it('says the network fee is not coming out of the amount', () => {
    // A fee listed beside an amount reads as subtracted from it. This one is not: the sponsor pays
    // it, and the label is the only thing that says so.
    render(<StakingExitDialog open quote={quote} onCancel={vi.fn()} onConfirm={vi.fn()} />)

    expect(
      (screen.getByTestId('staking-exit-networkFee').textContent ?? '').replace(/\D/g, '')
    ).toBe('0187853')
    expect(screen.getByText('staking.exit.networkFeeSponsored')).toBeInTheDocument()
  })

  it('adds up', () => {
    // The property behind the labels: the total is what the user owns, and the net is the total
    // less the one fee that is actually deducted.
    expect(BigInt(quote.grossLovelace)).toBe(
      BigInt(quote.utxoLovelace) + BigInt(quote.refundLovelace)
    )
    expect(BigInt(quote.netLovelace)).toBe(
      BigInt(quote.grossLovelace) - BigInt(quote.commercialFeeLovelace)
    )
  })

  it('will not confirm without a destination', () => {
    render(<StakingExitDialog open quote={quote} onCancel={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByTestId('staking-exit-confirm')).toBeDisabled()
  })

  it('rejects something that is not a Cardano address', async () => {
    render(<StakingExitDialog open quote={quote} onCancel={vi.fn()} onConfirm={vi.fn()} />)

    await userEvent.type(screen.getByTestId('staking-exit-recipient'), 'not-an-address')
    await userEvent.tab()

    expect(screen.getByText('staking.exit.recipientInvalid')).toBeInTheDocument()
    expect(screen.getByTestId('staking-exit-confirm')).toBeDisabled()
  })

  it('confirms with the destination it was given', async () => {
    const confirm = vi.fn()
    render(<StakingExitDialog open quote={quote} onCancel={vi.fn()} onConfirm={confirm} />)

    await userEvent.type(screen.getByTestId('staking-exit-recipient'), RECIPIENT)
    await userEvent.click(screen.getByTestId('staking-exit-confirm'))

    expect(confirm).toHaveBeenCalledWith(RECIPIENT)
  })

  it('warns that everything leaves the wallet', () => {
    render(<StakingExitDialog open quote={quote} onCancel={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByText('staking.exit.warning')).toBeInTheDocument()
  })

  describe('the figures', () => {
    /** A dialog renders in a portal, so its skeletons are counted on the document, not the mount. */
    const skeletons = (): number => document.body.querySelectorAll('.MuiSkeleton-root').length

    it('are blank, and say why, before there is a destination', () => {
      // Nothing has been asked of the backend: the quote depends on the address. A skeleton claims a
      // request is in flight, and one shown the moment the dialog opens reads as a hang.
      render(<StakingExitDialog open quote={null} onCancel={vi.fn()} onConfirm={vi.fn()} />)

      expect(skeletons()).toBe(0)
      expect(screen.getByTestId('staking-exit-awaiting')).toBeInTheDocument()
    })

    it('are shown as loading once there is an address worth quoting', async () => {
      render(
        <StakingExitDialog open quote={null} quoteLoading onCancel={vi.fn()} onConfirm={vi.fn()} />
      )

      await userEvent.type(screen.getByTestId('staking-exit-recipient'), RECIPIENT)

      expect(skeletons()).toBeGreaterThan(0)
      expect(screen.queryByTestId('staking-exit-awaiting')).toBeNull()
    })

    it('stop waiting when the quote failed', async () => {
      // A refused quote and one still being computed look the same when both are six grey bars.
      render(
        <StakingExitDialog open quote={null} quoteFailed onCancel={vi.fn()} onConfirm={vi.fn()} />
      )

      await userEvent.type(screen.getByTestId('staking-exit-recipient'), RECIPIENT)

      expect(screen.getByTestId('staking-exit-quote-failed')).toBeInTheDocument()
      expect(skeletons()).toBe(0)
      expect(screen.getByTestId('staking-exit-confirm')).toBeDisabled()
    })
  })

  it('reports the destination as it is typed, so a quote can follow it', async () => {
    const onRecipientChange = vi.fn()
    render(
      <StakingExitDialog
        open
        quote={quote}
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
        onRecipientChange={onRecipientChange}
      />
    )

    await userEvent.type(screen.getByTestId('staking-exit-recipient'), 'addr')

    expect(onRecipientChange).toHaveBeenLastCalledWith('addr')
  })
})
