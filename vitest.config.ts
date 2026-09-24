import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// ----------------------------------------------------------------------

/**
 * Component tests for this application.
 *
 * There was no test runner here before. What is configured is the minimum the staking and governance
 * screens need, and two of the choices are deliberate rather than conventional.
 *
 * **`include` is narrow.** It matches `src/**` test files only, so adding a runner does not sweep up
 * the Playwright specs under `e2e/` — those drive a real browser against a running application and
 * would hang under jsdom.
 *
 * **Nothing economic is reached.** These tests render components against fixtures; the hooks that call
 * the API are mocked per test. A component test that could start a staking operation would be a
 * component test that can spend money, and that is what the Playwright suite is for — under a separate
 * command, with a real session, and with the economic paths mocked there too unless somebody says
 * otherwise.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mirrors the `baseUrl` in tsconfig: the application imports everything as `src/...`.
      src: path.resolve(__dirname, 'src')
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'test/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e/**'],
    css: false
  }
})
