/**
 * Turning lovelace into something a person reads, without going through an unsafe number.
 *
 * Every amount the backend sends is a decimal string because lovelace quantities can exceed what a
 * JavaScript number holds exactly — one ada is a million lovelace, so a balance of ten billion ada is
 * past the safe integer range. `Number(value) / 1e6` is right for every figure anyone will actually
 * hold and silently wrong for the ones that matter most, which is the worst combination. So the split
 * is done on the string with `BigInt`, and only the already-divided result is ever formatted.
 */

/** Lovelace in one ada. */
const LOVELACE_PER_ADA = 1_000_000n

/** What Cardano shows: six decimals, always. */
const DECIMALS = 6

/**
 * Formats a lovelace amount as ada.
 *
 * @param lovelace - The amount, as the backend sends it. Anything unreadable formats as zero rather
 *   than as `NaN`: a balance panel is not a place to render a parse failure.
 * @param options - `maximumFractionDigits` trims the tail for display; the value itself is never
 *   rounded up, so a figure shown short is always at most what the wallet holds.
 * @returns The amount in ada, grouped for the locale the browser is in.
 */
export function formatAda(
  lovelace: string | null | undefined,
  options: { maximumFractionDigits?: number } = {}
): string {
  const amount = toLovelace(lovelace)
  const negative = amount < 0n
  const absolute = negative ? -amount : amount

  const whole = absolute / LOVELACE_PER_ADA
  const fraction = (absolute % LOVELACE_PER_ADA).toString().padStart(DECIMALS, '0')

  const keep = options.maximumFractionDigits ?? DECIMALS
  // Truncated, not rounded. Showing more than there is, even by a millionth, is the wrong direction to
  // be wrong in when the number is somebody's balance.
  const shown = keep <= 0 ? '' : fraction.slice(0, keep)

  const grouped = new Intl.NumberFormat(undefined, { useGrouping: true }).format(whole)
  const body = shown === '' ? grouped : `${grouped}${decimalSeparator()}${shown}`
  return negative ? `-${body}` : body
}

/**
 * Formats a lovelace amount with its unit.
 *
 * @param lovelace - The amount.
 * @param options - As {@link formatAda}.
 * @returns The amount followed by `ADA`.
 */
export function formatAdaWithUnit(
  lovelace: string | null | undefined,
  options: { maximumFractionDigits?: number } = {}
): string {
  return `${formatAda(lovelace, options)} ADA`
}

/**
 * Reads an amount the backend sent.
 *
 * @param lovelace - The amount, or nothing.
 * @returns The amount, or zero when it is absent or unreadable.
 */
export function toLovelace(lovelace: string | null | undefined): bigint {
  if (lovelace === null || lovelace === undefined) return 0n
  const text = String(lovelace).trim()
  if (!/^-?\d+$/.test(text)) return 0n
  return BigInt(text)
}

/**
 * Whether an amount is more than nothing.
 *
 * @param lovelace - The amount.
 * @returns `true` when it is positive.
 */
export function isPositive(lovelace: string | null | undefined): boolean {
  return toLovelace(lovelace) > 0n
}

/**
 * The decimal separator this browser's locale uses.
 *
 * Read from `Intl` rather than assumed, so a Spanish or Brazilian locale gets a comma and the figure
 * matches every other number on the page.
 */
function decimalSeparator(): string {
  const parts = new Intl.NumberFormat(undefined).formatToParts(1.1)
  return parts.find((part) => part.type === 'decimal')?.value ?? '.'
}
