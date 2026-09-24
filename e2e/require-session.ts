import { existsSync } from 'fs'
import type { FullConfig } from '@playwright/test'

import { STORAGE_STATE } from '../playwright.config'

// ----------------------------------------------------------------------

/**
 * Refuses to start the authenticated specs when nobody has signed in yet.
 *
 * Without this the run fails on a missing file, somewhere inside Playwright, with an `ENOENT` naming
 * a path in a directory git ignores. That reads like a broken checkout rather than like a step that
 * has not been taken, and the obvious repair — creating the file, or pointing the config somewhere
 * else — is the wrong one.
 *
 * The right repair is to sign in, and nothing but a person can do that here.
 *
 * @param config - The resolved configuration, holding the projects this run will actually execute.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  // Only the authenticated project needs the session. Running `--project=auth` is how the session
  // gets created, so demanding it there would make it impossible to ever create.
  const needsSession = config.projects.some((project) => project.name === 'staking')
  if (!needsSession || existsSync(STORAGE_STATE)) return

  throw new Error(
    [
      '',
      '  No saved session.',
      '',
      '  These specs run against an application you are signed in to, and the sign-in is done by',
      '  hand — credentials, PIN and second factor. Nothing here types them.',
      '',
      '    npm run e2e:login     a browser opens; sign in; the session is saved',
      '    npm run e2e           then this run works',
      '',
      `  The session would be at: ${STORAGE_STATE}`,
      ''
    ].join('\n')
  )
}

export default globalSetup
