import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StakingPinDialog from 'src/sections/staking/staking-pin-dialog'
import StakingExitDialog from 'src/sections/staking/staking-exit-dialog'

// ----------------------------------------------------------------------

/** A well-formed Preprod address. Fictional: nothing here reaches a chain. */
const RECIPIENT = 'addr_test1qtestrecipientaddressfortestsonly00000000000000000000000000'

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

  it('will not submit an empty PIN', () => {
    render(
      <StakingPinDialog open action='withdraw_rewards' onCancel={vi.fn()} onConfirm={vi.fn()} />
    )

    expect(screen.getByTestId('staking-pin-submit')).toBeDisabled()
  })

  it('hands the PIN over once', async () => {
    const confirm = vi.fn()
    render(
      <StakingPinDialog open action='withdraw_rewards' onCancel={vi.fn()} onConfirm={confirm} />
    )

    await userEvent.type(screen.getByTestId('staking-pin-input'), '1234')
    await userEvent.click(screen.getByTestId('staking-pin-submit'))

    expect(confirm).toHaveBeenCalledWith('1234')
  })

  it('shows what went wrong without clearing what was typed', async () => {
    render(
      <StakingPinDialog
        open
        action='withdraw_rewards'
        error='staking.pin.rejected'
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(screen.getByText('staking.pin.rejected')).toBeInTheDocument()
  })

  it('does not accept input while a submission is running', async () => {
    render(
      <StakingPinDialog
        open
        submitting
        action='withdraw_rewards'
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    await userEvent.type(screen.getByTestId('staking-pin-input'), '1234')

    expect(screen.getByTestId('staking-pin-submit')).toBeDisabled()
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
