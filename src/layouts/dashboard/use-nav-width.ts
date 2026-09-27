import { useSettingsContext } from 'src/components/settings'

import { NAV } from '../config-layout'

// ----------------------------------------------------------------------

type NavWidth = {
  isMini: boolean
  navWidth: number
}

/**
 * Desktop width of the vertical nav, derived from the persisted `themeLayout` preference.
 *
 * The rail, the header and the main content all size themselves from this value, so a change to the
 * preference moves the three together. Nothing else may compute the width: a second derivation is
 * how the header ends up wider than the rail and covering content.
 */
export function useNavWidth(): NavWidth {
  const settings = useSettingsContext()

  const isMini = settings.themeLayout === 'mini'

  return {
    isMini,
    navWidth: isMini ? NAV.W_MINI : NAV.W_VERTICAL
  }
}
