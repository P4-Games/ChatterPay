import { useLocales as getLocales } from 'src/locales'

// ----------------------------------------------------------------------

/*
 * Locales code
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */

type InputValue = string | number | null

function getLocaleCode() {
  const {
    currentLang: {
      numberFormat: { code, currency }
    }
  } = getLocales()

  return {
    code: code ?? 'en-US',
    currency: currency ?? 'USD'
  }
}

// ----------------------------------------------------------------------

export function getRecaptchaLng(currentLng: string) {
  // https://developers.google.com/recaptcha/docs/language?hl=es-419
  switch (currentLng.toLowerCase()) {
    case 'en':
      return 'en'
    case 'es':
      return 'es'
    case 'br':
      return 'pt-BR'
    default:
      return 'en'
  }
}

// ----------------------------------------------------------------------

export function fNumber(inputValue: InputValue) {
  const { code } = getLocaleCode()

  if (!inputValue) return ''

  const number = Number(inputValue)

  const fm = new Intl.NumberFormat(code, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(number)

  return fm
}

// ----------------------------------------------------------------------

export function fCurrency(inputValue: InputValue) {
  const { code, currency } = getLocaleCode()

  if (!inputValue) return ''

  const number = Number(inputValue)

  const fm = new Intl.NumberFormat(code, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(number)

  return fm
}

// ----------------------------------------------------------------------

export function fPercent(inputValue: InputValue) {
  const { code } = getLocaleCode()

  if (!inputValue) return ''

  const number = Number(inputValue) / 100

  const fm = new Intl.NumberFormat(code, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(number)

  return fm
}

// ----------------------------------------------------------------------

export function fShortenNumber(inputValue: InputValue) {
  const { code } = getLocaleCode()

  if (!inputValue) return ''

  const number = Number(inputValue)

  const fm = new Intl.NumberFormat(code, {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(number)

  return fm.replace(/[A-Z]/g, (match) => match.toLowerCase())
}

// ----------------------------------------------------------------------

export function fData(inputValue: InputValue) {
  if (!inputValue) return ''

  if (inputValue === 0) return '0 Bytes'

  const units = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb']

  const decimal = 2

  const baseValue = 1024

  const number = Number(inputValue)

  const index = Math.floor(Math.log(number) / Math.log(baseValue))

  const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`

  return fm
}
