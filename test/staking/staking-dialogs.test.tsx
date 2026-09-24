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
  const quote = {
    grossLovelace: '10000000',
    networkFeeLovelace: '180000',
    commercialFeeLovelace: '500000',
    refundLovelace: '2000000',
    netLovelace: '11500000'
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

    expect(screen.getByTestId('staking-exit-gross')).toHaveTextContent('10.000000 ADA')
    expect(screen.getByTestId('staking-exit-refund')).toHaveTextContent('2.000000 ADA')
    expect(screen.getByTestId('staking-exit-networkFee')).toHaveTextContent('0.180000 ADA')
    expect(screen.getByTestId('staking-exit-commercialFee')).toHaveTextContent('0.500000 ADA')
    expect(screen.getByTestId('staking-exit-net')).toHaveTextContent('11.500000 ADA')
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
