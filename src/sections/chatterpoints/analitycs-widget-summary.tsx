import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import type { CardProps } from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { fShortenNumber } from 'src/utils/format-number'

import { bgGradient } from 'src/theme/css'
import type { ColorSchema } from 'src/theme/palette'

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string
  total: number
  icon: React.ReactNode
  color?: ColorSchema
  loading: boolean
}

export default function AnalyticsWidgetSummary({
  title,
  total,
  icon,
  color = 'primary',
  loading = false,
  sx,
  ...other
}: Props) {
  const theme = useTheme()

  return (
    <Stack
      alignItems='center'
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette[color].light, 0.2),
          endColor: alpha(theme.palette[color].main, 0.2)
        }),
        py: 5,
        borderRadius: 2,
        textAlign: 'center',
        color: `${color}.darker`,
        backgroundColor: 'common.white',
        ...sx
      }}
      {...other}
    >
      {loading ? (
        <>
          <Skeleton variant='circular' width={64} height={64} sx={{ mb: 1 }} />
          <Skeleton variant='text' width={120} height={40} />
          <Skeleton variant='text' width={80} height={24} sx={{ mt: 1 }} />
        </>
      ) : (
        <>
          {icon && <Box sx={{ width: 64, height: 64, mb: 1 }}>{icon}</Box>}

          <Typography variant='h3'>{fShortenNumber(total) || 0}</Typography>

          <Typography variant='subtitle2' sx={{ opacity: 0.64 }}>
            {title}
          </Typography>
        </>
      )}
    </Stack>
  )
}
