import { describe, expect, it } from 'vitest'

import {
  formatAda,
  formatAdaWithUnit,
  isPositive,
  toLovelace
} from 'src/sections/staking/staking-amount'

// ----------------------------------------------------------------------

/**
 * Turning lovelace into a figure a person reads.
 *
 * Two properties matter more than the rest and both are about being wrong in the safe direction.
 *
 * **Nothing goes through a JavaScript number.** One ada is a million lovelace, so a balance past
 * about nine billion ada exceeds the safe integer range — `Number(value) / 1e6` is exact for every
 * amount anyone will actually hold and silently wrong for the ones where it matters, which is the
 * worst combination a rounding bug can have.
 *
 * **It truncates.** Showing a millionth more than the wallet holds is how a transfer of "the whole
 * balance" fails at the last step, so a figure shown short is always at most what is really there.
 *
 * The grouping and the decimal separator come from the browser's locale, so the assertions here are
 * written against `Intl` rather than against a comma: a run in a Spanish locale is not a failure.
 */

/** The decimal separator this environment uses, read the same way the code under test reads it. */
const DECIMAL = new Intl.NumberFormat(undefined)
  .formatToParts(1.1)
  .find((part) => part.type === 'decimal')!.value

describe('reading an amount', () => {
  it('reads a plain decimal string', () => {
    expect(toLovelace('1500000')).toBe(1_500_000n)
  })

  it('reads an amount past the safe integer range exactly', () => {
    // The reason the whole module exists. As a number this loses its last digits.
    expect(toLovelace('90071992547409910')).toBe(90_071_992_547_409_910n)
  })

  it('treats an absent amount as nothing', () => {
    expect(toLovelace(null)).toBe(0n)
    expect(toLovelace(undefined)).toBe(0n)
  })

  it('treats an unreadable amount as nothing rather than as NaN', () => {
    // A balance panel is not a place to render a parse failure.
    expect(toLovelace('1.5')).toBe(0n)
    expect(toLovelace('one')).toBe(0n)
    expect(toLovelace('')).toBe(0n)
  })

  it('reads a negative amount', () => {
    expect(toLovelace('-2000000')).toBe(-2_000_000n)
  })
})

describe('formatting an amount', () => {
  it('always shows six decimals, which is what Cardano shows', () => {
    expect(formatAda('1000000')).toBe(`1${DECIMAL}000000`)
  })

  it('keeps every significant digit of a large balance', () => {
    // 10000 ada. Grouped however the locale groups, so the digits are checked without the separator.
    expect(formatAda('10000000000').replace(/\D/g, '')).toBe('10000000000')
  })

  it('groups a large whole part', () => {
    // Something other than digits and the decimal separator has to appear, or the figure is an
    // unreadable run of zeros.
    const grouped = formatAda('10000000000').split(DECIMAL)[0]

    expect(grouped).not.toMatch(/^\d+$/)
  })

  it('does not group a small one', () => {
    expect(formatAda('999000000').split(DECIMAL)[0]).toBe('999')
  })

  it('truncates rather than rounding up', () => {
    // 1.9999995 ada. Rounded this reads as 2, which is more than the wallet holds.
    expect(formatAda('1999999', { maximumFractionDigits: 2 })).toBe(`1${DECIMAL}99`)
  })

  it('truncates a figure that would round up on every digit', () => {
    expect(formatAda('1999999', { maximumFractionDigits: 6 })).toBe(`1${DECIMAL}999999`)
  })

  it('drops the decimals entirely when asked for none', () => {
    expect(formatAda('1999999', { maximumFractionDigits: 0 })).toBe('1')
  })

  it('pads a fraction with leading zeros', () => {
    // One lovelace. Without the padding this reads as 1.1 ada, a million times too much.
    expect(formatAda('1')).toBe(`0${DECIMAL}000001`)
  })

  it('formats nothing as zero', () => {
    expect(formatAda(null)).toBe(`0${DECIMAL}000000`)
  })

  it('keeps the sign on a negative amount', () => {
    expect(formatAda('-2500000')).toBe(`-2${DECIMAL}500000`)
  })

  it('puts the unit after the figure', () => {
    expect(formatAdaWithUnit('2000000')).toBe(`2${DECIMAL}000000 ADA`)
  })
})

describe('whether an amount is more than nothing', () => {
  it('says so for a positive amount', () => {
    expect(isPositive('1')).toBe(true)
  })

  it('says no for zero, for nothing and for something unreadable', () => {
    expect(isPositive('0')).toBe(false)
    expect(isPositive(null)).toBe(false)
    expect(isPositive('later')).toBe(false)
  })

  it('says no for a negative amount', () => {
    expect(isPositive('-1')).toBe(false)
  })
})
