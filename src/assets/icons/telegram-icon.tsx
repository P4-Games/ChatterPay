import { memo } from 'react'

import { useTheme } from '@mui/material/styles'
import Box, { BoxProps } from '@mui/material/Box'

type Mode = 'brand' | 'light' | 'dark'

interface TelegramIconProps extends BoxProps {
  mode?: Mode
}

/**
 * TelegramIcon
 * - mode='brand'  -> circle #229ED9, plane #FFF (oficial)
 * - mode='light'  -> circle white, plane black
 * - mode='dark'   -> circle black, plane white
 */
function TelegramIcon({ mode = 'brand', ...other }: TelegramIconProps) {
  const theme = useTheme()

  const bg =
    mode === 'brand'
      ? '#229ED9'
      : mode === 'light'
        ? theme.palette.common.white
        : theme.palette.common.black

  const plane =
    mode === 'brand'
      ? theme.palette.common.white
      : mode === 'light'
        ? theme.palette.common.black
        : theme.palette.common.white

  return (
    <Box
      component='svg'
      role='img'
      aria-label='Telegram'
      width='100%'
      height='100%'
      viewBox='0 0 96 96'
      xmlns='http://www.w3.org/2000/svg'
      {...other}
    >
      {/* Circle background */}
      <circle cx='50' cy='48' r='48' fill={bg} />

      {/* Paper plane (proporciones estándar, nítidas a 96x96) */}
      <path
        fill={plane}
        d='M74.8 23.6c1.9-.7 3.6.9 3.1 3L72 71.8c-.4 2-2.4 2.8-4.2 1.7l-18.3-11.5-6.7 6.6c-.7.7-1.3 1-2.2 1-.9 0-1.3-.4-1.6-1.3l-5.5-16.9-14.4-4.6c-2.1-.7-2.1-2.7.1-3.6l55.6-21.6ZM35.7 49.7l5.1 15.7.5-9.3 20.6-18.8c.7-.6.1-1.2-.7-.7L35.7 49.7Z'
      />
    </Box>
  )
}

export default memo(TelegramIcon)
export { TelegramIcon }
