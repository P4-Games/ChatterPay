import path from 'path'
import { defineConfig, devices } from '@playwright/test'

// ----------------------------------------------------------------------

/**
 * End-to-end tests for the staking and governance screens.
 *
 * Two things about this configuration are deliberate and unusual, and both come from the same decision:
 * **the login is performed by a person, not by the suite.**
 *
 * There is no `storageState` recorded in the repository and no credentials anywhere in it. The session
 * is created by hand, once, into a file that git ignores, by running the `auth.setup` project in headed
 * mode and signing in — PIN and second factor included — while the browser waits. Automating that would
 * mean either putting a password in the repository or building a way around the second factor, and both
 * of those are worse than the inconvenience of typing it.
 *
 * `headless: false` is the default here for the same reason. These tests are run by somebody watching
 * them, against a running application, on a session they created; a headless default would invite them
 * to be wired into CI, where the session does not exist and the only way to make them pass is to
 * automate the thing that must not be automated.
 *
 * Economic operations are **not** executed. The specs stop at the confirmation and assert what the
 * screen says; the routes that would move funds are intercepted. Running them for real needs a
 * deliberate decision and a funded test wallet, and it is not something a test run should be able to do
 * by accident.
 */

/** Where the session the operator created by hand is kept. Git ignores it. */
export const STORAGE_STATE = path.join(__dirname, 'e2e/.auth/session.json')

/** The application under test. Local by default; never a production URL. */
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  // One worker: these share one hand-made session, and parallel workers would race on it.
  workers: 1,
  fullyParallel: false,
  // No retries. A flake that is retried away in a suite driving real money is a flake nobody looks at.
  retries: 0,
  reporter: [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    headless: false,
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'off'
  },

  projects: [
    {
      // Run this one on its own, by hand, to create the session:
      //   npx playwright test --project=auth
      name: 'auth',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'staking',
      testMatch: /.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE }
    }
  ]
})
