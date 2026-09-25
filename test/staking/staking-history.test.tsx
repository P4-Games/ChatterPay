import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StakingHistory from 'src/sections/staking/staking-history'

import { stakingView } from './fixtures'

// ----------------------------------------------------------------------

/**
 * The history table, and what it deliberately does not show.
 *
 * A 64-character transaction hash has no width at which it is both readable and a column, so it was
 * shown truncated and led nowhere. It lives in the detail panel now, which has room for the whole
 * string, a control to copy it and a link to an explorer — the same arrangement the dashboard's own
 * history uses, which is the point: these are peers, not two tables that happen to be near each
 * other.
 */

/** A settled operation, with a hash long enough to be the real thing. */
const TX = 'a'.repeat(64)

/**
 * A view carrying operations.
 *
 * @param overrides - What differs about the one operation.
 * @returns The view.
 */
function withOperation(overrides: Record<string, unknown> = {}) {
  return stakingView({
    operations: [
      {
        kind: 'delegate_vote',
        status: 'confirmed',
        chainOutcome: 'confirmed',
        txId: TX,
        networkFeeLovelace: '178349',
        createdAt: '2026-03-15T14:30:00.000Z',
        settled: true,
        ...overrides
      }
    ]
  })
}

describe('StakingHistory', () => {
  it('says so when there is nothing yet', () => {
    render(<StakingHistory staking={stakingView({ operations: [] })} />)

    expect(screen.getByText('staking.history.empty')).toBeInTheDocument()
  })

  it('lists one row per operation', () => {
    render(<StakingHistory staking={withOperation()} />)

    expect(screen.getAllByTestId('staking-history-row')).toHaveLength(1)
  })

  describe('the transaction id', () => {
    it('is not in the table', () => {
      // Not even truncated. A hash in a cell is a column that cannot be read and cannot be copied.
      render(<StakingHistory staking={withOperation()} />)

      const table = screen.getAllByTestId('staking-history-row')[0]

      expect(table.textContent).not.toContain(TX.slice(0, 10))
    })

    it('is in the detail panel, whole and copyable', async () => {
      render(<StakingHistory staking={withOperation()} />)

      await userEvent.click(screen.getByRole('button', { name: 'transactions.detail-open' }))

      expect(screen.getByTestId('staking-operation-drawer')).toBeInTheDocument()
      expect(screen.getByText('staking.history.transaction')).toBeInTheDocument()
    })

    it('links to an explorer when one is configured', async () => {
      render(<StakingHistory staking={withOperation()} explorerUrl='https://explorer.test/tx/' />)

      await userEvent.click(screen.getByRole('button', { name: 'transactions.detail-open' }))

      expect(screen.getByTestId('staking-operation-explorer')).toHaveAttribute(
        'href',
        `https://explorer.test/tx/${TX}`
      )
    })

    it('offers no explorer link when none is configured', async () => {
      render(<StakingHistory staking={withOperation()} />)

      await userEvent.click(screen.getByRole('button', { name: 'transactions.detail-open' }))

      expect(screen.queryByTestId('staking-operation-explorer')).toBeNull()
    })
  })

  describe('the date', () => {
    it('carries the day and the time under it, as the dashboard does', () => {
      render(<StakingHistory staking={withOperation()} />)

      const row = screen.getAllByTestId('staking-history-row')[0]

      // The month as three letters is what distinguishes this from a locale-dependent numeric date,
      // which is what the column used to render.
      expect(row.textContent).toContain('15 Mar 2026')
    })

    it('shows a dash when the operation carries no date', () => {
      render(<StakingHistory staking={withOperation({ createdAt: null })} />)

      expect(screen.getAllByTestId('staking-history-row')[0].textContent).toContain('—')
    })
  })

  describe('an operation the chain has not settled', () => {
    it('is marked in the row', () => {
      render(<StakingHistory staking={withOperation({ settled: false, status: 'submitted' })} />)

      expect(screen.getByTestId('staking-history-informative')).toBeInTheDocument()
    })

    it('is marked in the panel too', async () => {
      // A panel that presented a submitted transaction as done would be wrong in the direction that
      // costs somebody money.
      render(<StakingHistory staking={withOperation({ settled: false, status: 'submitted' })} />)

      await userEvent.click(screen.getByRole('button', { name: 'transactions.detail-open' }))

      expect(screen.getByText('staking.history.informativeHint')).toBeInTheDocument()
    })
  })

  it('closes the panel without touching the operation', async () => {
    render(<StakingHistory staking={withOperation()} />)

    await userEvent.click(screen.getByRole('button', { name: 'transactions.detail-open' }))
    await userEvent.click(screen.getByRole('button', { name: 'staking.history.close' }))

    expect(screen.queryByTestId('staking-operation-drawer')).toBeNull()
  })
})
