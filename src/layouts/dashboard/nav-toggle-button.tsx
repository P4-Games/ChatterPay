import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

import { useTranslate } from 'src/locales'

import Iconify from 'src/components/iconify'
import { useSettingsContext } from 'src/components/settings'

// ----------------------------------------------------------------------

/**
 * Collapses the desktop nav to the icon rail and expands it again.
 *
 * The state is the persisted `themeLayout` setting ('vertical' <-> 'mini'), not local state, so the
 * choice survives navigation and reloads and the header and main content derive their width from the
 * same value.
 */
export default function NavToggleButton() {
  const { t } = useTranslate()

  const settings = useSettingsContext()

  const isMini = settings.themeLayout === 'mini'

  const label = isMini ? t('menu.expandNav') : t('menu.collapseNav')

  const handleToggle = () => {
    settings.onUpdate('themeLayout', isMini ? 'vertical' : 'mini')
  }

  return (
    <Tooltip title={label} placement='right'>
      <IconButton
        size='small'
        aria-label={label}
        aria-expanded={!isMini}
        aria-controls='nav-section-vertical'
        onClick={handleToggle}
        sx={{
          width: 32,
          height: 32,
          color: 'text.secondary',
          border: (theme) => `dashed 1px ${theme.palette.divider}`
        }}
      >
        <Iconify
          width={18}
          icon={isMini ? 'eva:arrow-ios-forward-fill' : 'eva:arrow-ios-back-fill'}
        />
      </IconButton>
    </Tooltip>
  )
}
