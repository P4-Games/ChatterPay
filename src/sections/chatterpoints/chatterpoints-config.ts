import type { ColorSchema } from 'src/theme/palette'

// ----------------------------------------------------------------------

export type ChatterpointsCategory = 'games' | 'operations' | 'social'

export interface CategoryMeta {
  icon: string
  color: ColorSchema
  labelKey: string
}

/**
 * Visual identity for each Chatterpoints earning category.
 * Colors keep the mapping of the previous page (games=info,
 * operations=success, social=warning) so returning users re-orient fast.
 */
export const CATEGORY_META: Record<ChatterpointsCategory, CategoryMeta> = {
  games: {
    icon: 'solar:gamepad-bold-duotone',
    color: 'info',
    labelKey: 'chatterpoints.categories.games'
  },
  operations: {
    icon: 'solar:card-transfer-bold-duotone',
    color: 'success',
    labelKey: 'chatterpoints.categories.operations'
  },
  social: {
    icon: 'solar:users-group-rounded-bold-duotone',
    color: 'warning',
    labelKey: 'chatterpoints.categories.social'
  }
}

export const CATEGORY_ORDER: ChatterpointsCategory[] = ['games', 'operations', 'social']

/**
 * Formats raw backend identifiers (WORDLE, SIGN_UP, X) into display casing.
 * @param {string} raw - Raw identifier from the API.
 * @returns {string} Human-readable label (e.g. "Wordle", "Sign Up").
 */
export function formatRawLabel(raw: string): string {
  if (!raw) return ''
  if (raw.length <= 2) return raw.toUpperCase()
  return raw
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
