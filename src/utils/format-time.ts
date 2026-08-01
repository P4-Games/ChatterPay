import { format, getTime, formatDistanceToNow } from 'date-fns'

// ----------------------------------------------------------------------

type InputValue = Date | string | number | null | undefined

export function fDate(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy'

  return date ? format(new Date(date), fm) : ''
}

export function fTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'p'

  return date ? format(new Date(date), fm) : ''
}

export function fDateTime(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy p'

  return date ? format(new Date(date), fm) : ''
}

export function fTimestamp(date: InputValue) {
  return date ? getTime(new Date(date)) : ''
}

/**
 * Normalize a timestamp that may be epoch seconds (e.g. Polymarket APIs),
 * epoch milliseconds, or a date string, to epoch milliseconds.
 */
export function toEpochMs(date: InputValue): number {
  if (typeof date === 'number') return date > 1e12 ? date : date * 1000
  return date ? new Date(date).getTime() : 0
}

export function fToNow(date: InputValue) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true
      })
    : ''
}

export function isBetween(inputDate: Date | string | number, startDate: Date, endDate: Date) {
  const date = new Date(inputDate)

  const results =
    new Date(date.toDateString()) >= new Date(startDate.toDateString()) &&
    new Date(date.toDateString()) <= new Date(endDate.toDateString())

  return results
}

export function isAfter(startDate: Date | null, endDate: Date | null) {
  const results =
    startDate && endDate ? new Date(startDate).getTime() > new Date(endDate).getTime() : false

  return results
}
