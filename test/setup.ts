import '@testing-library/jest-dom/vitest'

import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// ----------------------------------------------------------------------

/**
 * What every component test gets before it runs.
 *
 * The translation layer is stubbed rather than loaded. Loading the real i18next instance in a unit test
 * would make every assertion depend on the copy in three JSON files, so a wording change would break
 * tests that are about behaviour. The stub returns the key, which means a test asserts on
 * `staking.notices.optedOutTitle` — the fact that the notice is shown — rather than on the sentence.
 *
 * Interpolation is still applied, because some components pass a value that has to reach the screen and
 * a stub that dropped it would hide that.
 */
vi.mock('src/locales', () => ({
  useTranslate: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options && typeof options.defaultValue === 'string' && key.includes('undefined')) {
        return options.defaultValue
      }
      const values = Object.entries(options ?? {}).filter(([name]) => name !== 'defaultValue')
      return values.length === 0
        ? key
        : `${key}|${values.map(([name, value]) => `${name}=${String(value)}`).join(',')}`
    }
  }),
  useLocales: () => ({ currentLang: { value: 'en' } })
}))

afterEach(() => {
  cleanup()
})
