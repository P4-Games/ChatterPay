import { m } from 'framer-motion'
import { useCallback } from 'react'

import IconButton from '@mui/material/IconButton'

import SvgColor from 'src/components/svg-color'
import { varHover } from 'src/components/animate'
import { useSettingsContext } from 'src/components/settings'

// ----------------------------------------------------------------------

export default function SettingsModeButton() {
  const settings = useSettingsContext()

  const handleChangeMode = useCallback(() => {
    const newMode = settings.themeMode === 'light' ? 'dark' : 'light'
    settings.onUpdate('themeMode', newMode)
  }, [settings])

  return (
    <IconButton
      component={m.button as any}
      whileTap='tap'
      whileHover='hover'
      variants={varHover(1.05)}
      onClick={handleChangeMode}
      sx={{
        width: 40,
        height: 40,
        bgcolor: settings.themeMode === 'dark' ? 'background.paper' : 'background.default',
        '&:hover': {
          bgcolor: settings.themeMode === 'dark' ? 'background.paper' : 'background.default'
        }
      }}
    >
      <SvgColor
        src={`/assets/icons/setting/ic_${settings.themeMode === 'dark' ? 'sun' : 'moon'}.svg`}
        color={settings.themeMode === 'dark' ? '#FFD700' : 'FFFFFF'}
      />
    </IconButton>
  )
}
