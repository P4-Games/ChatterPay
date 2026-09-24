import { expect, test } from '@playwright/test'

import { STORAGE_STATE } from '../playwright.config'

// ----------------------------------------------------------------------

/**
 * Creating the session, by hand, once.
 *
 * Run this on its own and sign in yourself:
 *
 *     npx playwright test --project=auth
 *
 * A browser opens on the login page and then **waits**. Type the credentials, the PIN and whatever
 * second factor the account has; the test watches for the dashboard to appear and saves the session to
 * a file git ignores. Every other spec reuses that file.
 *
 * Nothing here types a password, and nothing here should ever be changed to. Automating this would mean
 * one of two things: a credential committed to the repository, or a way around the second factor built
 * into the test suite. Both are worse than the inconvenience of signing in by hand, and both are the
 * kind of thing that exists forever once it exists at all.
 *
 * The long timeout is the whole mechanism. It is how long the browser will sit there waiting for a
 * person, and it is generous on purpose — a second factor arriving by message can take a while.
 */

/** How long the browser waits for a person to finish signing in. */
const MANUAL_LOGIN_TIMEOUT_MS = 10 * 60 * 1000

test('save the session after signing in by hand', async ({ page }) => {
  test.setTimeout(MANUAL_LOGIN_TIMEOUT_MS + 60_000)

  await page.goto('/auth/jwt/login')

  // eslint-disable-next-line no-console
  console.log(
    [
      '',
      '  Sign in in the browser that just opened.',
      '  Credentials, PIN and second factor are yours to enter; this test types nothing.',
      '  It is waiting for the dashboard to load, then it saves the session.',
      ''
    ].join('\n')
  )

  // The signal that the operator is done. Waiting for a URL rather than for an element keeps this from
  // depending on the dashboard's markup, which changes far more often than its address.
  await page.waitForURL(/\/dashboard(\/|$)/, { timeout: MANUAL_LOGIN_TIMEOUT_MS })

  await expect(page).toHaveURL(/\/dashboard/)

  await page.context().storageState({ path: STORAGE_STATE })

  // eslint-disable-next-line no-console
  console.log(`  Session saved. The staking specs can run now.\n`)
})
