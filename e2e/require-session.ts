import { existsSync } from 'fs'
import type { FullConfig } from '@playwright/test'

import { STORAGE_STATE } from '../playwright.config'

// ----------------------------------------------------------------------

/**
 * Which projects this run was asked for.
 *
 * @returns The names passed with `--project`, or every project's name when none was passed, since
 *   that runs all of them.
 */
function selectedProjects(): string[] {
  const names: string[] = []
  const argv = process.argv

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument.startsWith('--project=')) names.push(argument.slice('--project='.length))
    else if (argument === '--project' && index + 1 < argv.length) names.push(argv[index + 1])
  }

  // No filter means every project runs, and the auth project is one of them.
  return names.length > 0 ? names : ['auth', 'staking']
}

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
  // Read off the command line rather than off `config.projects`, which is not narrowed by
  // `--project` at this point and lists every project whatever was asked for. Both readings of it
  // are wrong in opposite directions: looking for `staking` refuses the auth run that would create
  // the session, and looking for `auth` lets the staking run through to a bare ENOENT.
  //
  // A run that includes the auth project is about to create the session, so there is nothing to say.
  if (selectedProjects().includes('auth') || existsSync(STORAGE_STATE)) return

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
