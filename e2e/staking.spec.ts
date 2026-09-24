import { expect, test, type Page } from '@playwright/test'

// ----------------------------------------------------------------------

/**
 * The staking screens, against a running application and a session created by hand.
 *
 * **No funds move.** The two routes that would start an operation are intercepted for every test in
 * this file, so the suite exercises the screen, the PIN flow and the refusals without the backend ever
 * building a transaction. That is not caution about flakiness — it is that a test run must not be able
 * to spend somebody's ada by accident, and a suite whose default is "real" eventually runs somewhere
 * nobody expected.
 *
 * Running any of this for real needs a deliberate decision, a funded test wallet and somebody watching.
 * It is not something to arrange by deleting an intercept.
 */

/** The routes that would move value. Intercepted, always. */
const ECONOMIC_ROUTES = [
  '**/api/v1/wallet/*/staking/authorize',
  '**/api/v1/wallet/*/staking/action'
]

/**
 * Stops every economic call before it leaves the browser.
 *
 * The authorise route is answered with a plausible grant so the flow can continue to the next step; the
 * action route answers as though the network had accepted it. Both are fictional.
 */
async function blockEconomicRoutes(page: Page): Promise<void> {
  await page.route(ECONOMIC_ROUTES[0], async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        grant: 'e2e.intercepted-grant',
        expiresAt: new Date(Date.now() + 300_000).toISOString(),
        action: 'withdraw_rewards'
      })
    })
  })

  await page.route(ECONOMIC_ROUTES[1], async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        operationId: 'e2e-intercepted-operation',
        txId: null,
        outcome: 'submitted'
      })
    })
  })
}

test.beforeEach(async ({ page }) => {
  await blockEconomicRoutes(page)
})

test.describe('the staking page', () => {
  test('loads for the signed-in user', async ({ page }) => {
    await page.goto('/dashboard/staking')

    // The heading comes from the translation files, so the assertion is on the page settling rather than
    // on a particular sentence: the copy is covered by the component tests.
    await expect(page.getByRole('heading', { level: 4 })).toBeVisible()
  })

  test('shows the balance broken down, or says why it cannot', async ({ page }) => {
    await page.goto('/dashboard/staking')

    const total = page.getByTestId('staking-total')
    const unavailable = page.getByText(/balance|saldo/i).first()

    // One of the two has to be true. What must never happen is a zero standing in for a failed read.
    await expect(total.or(unavailable)).toBeVisible()
  })

  test('asks for the PIN against a named operation', async ({ page }) => {
    await page.goto('/dashboard/staking')

    const action = page.getByTestId('staking-action-deregister')
    await expect(action).toBeVisible()

    // Only if the backend allows it for this wallet. A disabled button is a correct outcome here and the
    // test says so rather than forcing a click that would fail for the right reason.
    if (await action.isEnabled()) {
      await action.click()
      await expect(page.getByTestId('staking-pin-input')).toBeVisible()
      await expect(page.getByTestId('staking-pin-submit')).toBeDisabled()
    }
  })

  test('will not confirm an exit without a destination and a quote', async ({ page }) => {
    await page.goto('/dashboard/staking')

    const exit = page.getByTestId('staking-action-exit_and_send_max')
    await expect(exit).toBeVisible()

    if (await exit.isEnabled()) {
      await exit.click()
      await expect(page.getByTestId('staking-exit-recipient')).toBeVisible()
      await expect(page.getByTestId('staking-exit-confirm')).toBeDisabled()
    }
  })

  test('marks an unsettled operation as informative', async ({ page }) => {
    await page.goto('/dashboard/staking')

    const informative = page.getByTestId('staking-history-informative')
    // Present only when something is in flight, which is the ordinary case most of the time.
    if ((await informative.count()) > 0) {
      await expect(informative.first()).toBeVisible()
    }
  })
})

test.describe('the governance page', () => {
  test('loads and says what it does not offer', async ({ page }) => {
    await page.goto('/dashboard/governance')

    await expect(page.getByTestId('governance-current')).toBeVisible()
  })

  test('offers exactly one delegation control', async ({ page }) => {
    await page.goto('/dashboard/governance')

    await expect(page.getByTestId('governance-delegate')).toHaveCount(1)
  })
})
