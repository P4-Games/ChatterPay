import { ApexOptions } from 'apexcharts'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { CardProps } from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { fPercent, fCurrency } from 'src/utils/format-number'

import { bgGradient } from 'src/theme/css'
import { ColorSchema } from 'src/theme/palette'

import Iconify from 'src/components/iconify'
import Chart, { useChart } from 'src/components/chart'

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string
  total: number
  percent: number
  color?: ColorSchema
  icon: string
  chart: {
    series: {
      x: number
      y: number
    }[]
    options?: ApexOptions
  }
}

export default function BankingWidgetSummary({
  title,
  total,
  icon,
  percent,
  color = 'primary',
  chart,
  sx,
  ...other
}: Props) {
  const theme = useTheme()

  const { series, options } = chart

  const chartOptions = useChart({
    colors: [theme.palette[color].dark],
    chart: {
      sparkline: {
        enabled: true
      }
    },
    xaxis: {
      labels: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: false
      }
    },
    legend: {
      show: false
    },
    grid: {
      show: false
    },
    tooltip: {
      marker: {
        show: false
      },
      y: {
        formatter: (value: number) => fCurrency(value),
        title: {
          formatter: () => ''
        }
      }
    },
    ...options
  })

  return (
    <Stack
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette[color].light, 0.2),
          endColor: alpha(theme.palette[color].main, 0.2)
        }),
        width: 1,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        color: `${color}.darker`,
        backgroundColor: 'common.white',
        ...sx
      }}
      {...other}
    >
      <Iconify
        icon={icon}
        sx={{
          p: 1.5,
          top: 24,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          position: 'absolute',
          color: `${color}.lighter`,
          bgcolor: `${color}.dark`
        }}
      />

      <Stack spacing={1} sx={{ p: 3 }}>
        <Typography variant='subtitle2'>{title}</Typography>

        <Typography variant='h3'>{fCurrency(total)}</Typography>

        <Stack
          spacing={0.5}
          direction='row'
          flexWrap='wrap'
          alignItems='center'
          sx={{ typography: 'body2' }}
        >
          <Iconify icon={percent < 0 ? 'eva:trending-down-fill' : 'eva:trending-up-fill'} />

          <Box sx={{ typography: 'subtitle2' }}>
            {percent > 0 && '+'}
            {fPercent(percent)}
          </Box>

          <Box sx={{ opacity: 0.8 }}>than last month</Box>
        </Stack>
      </Stack>

      <Chart
        dir='ltr'
        type='area'
        series={[{ data: series }]}
        options={chartOptions}
        width='100%'
        height={120}
      />
    </Stack>
  )
}
