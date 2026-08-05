import rawFeesData from './fees-data.json'

import type { FeesContent } from './fees-types'

// ----------------------------------------------------------------------

/**
 * JSON imports widen every string literal (`"badge"`, `"success"`, ...) to `string`,
 * so the discriminated unions in `FeesContent` can only be restored with a cast.
 * Shape stays enforced through `fees-types.ts` at every consumption site.
 */
export const FEES_CONTENT = rawFeesData as unknown as FeesContent
