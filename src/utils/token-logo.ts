/**
 * Ticker lookups that do not care about casing.
 *
 * The token catalogue stores `USDT`, transactions carry `usdt`, and nothing guarantees a third
 * source will not send `UsDt`. An exact-match lookup showed the ticker initials instead of the icon
 * for every row whose casing did not happen to match the catalogue.
 *
 * Both sides go through here: the map is built with normalized keys and read with a normalized
 * lookup, so any casing resolves to the same entry.
 */

/** The form a ticker takes as a key. */
export function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase()
}

/**
 * The logo for a ticker, whatever its casing.
 *
 * @param logos - Map built with {@link normalizeTicker} keys.
 * @param ticker - Ticker as it comes from a balance or a transaction row.
 * @returns The logo URL, or undefined when the token has none.
 */
export function tokenLogo(
  logos: Record<string, string>,
  ticker: string | undefined | null
): string | undefined {
  if (!ticker) return undefined
  return logos[normalizeTicker(ticker)]
}
