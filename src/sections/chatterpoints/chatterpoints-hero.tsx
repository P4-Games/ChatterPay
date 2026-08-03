import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { fNumber } from 'src/utils/format-number'
import Chart, { useChart } from 'src/components/chart'
import Iconify from 'src/components/iconify'

import type { ChatterpointsHistoryResult } from 'src/types/chatterpoints'

import { CATEGORY_META, CATEGORY_ORDER } from './chatterpoints-config'

// ----------------------------------------------------------------------

type Props = {
  totals: ChatterpointsHistoryResult['totals']
  loading: boolean
}

/**
 * Hero section for the Chatterpoints page: headline, grand total card and
 * a category breakdown donut. Mirrors the polymarket hub hero layout.
 * @param {Props} props - Totals per category and loading flag.
 * @returns {JSX.Element} Hero section.
 */
export default function ChatterpointsHero({ totals, loading }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()

  const grandTotal = totals?.grandTotal ?? 0
  const series = CATEGORY_ORDER.map((key) => totals?.[key] ?? 0)
  const hasPoints = grandTotal > 0

  const chartOptions = useChart({
    colors: CATEGORY_ORDER.map((key) => theme.palette[CATEGORY_META[key].color].main),
    labels: CATEGORY_ORDER.map((key) => t(CATEGORY_META[key].labelKey)),
    stroke: { colors: [theme.palette.background.paper] },
    legend: { show: false },
    dataLabels: { enabled: false },
    tooltip: {
      fillSeriesColor: false,
      y: { formatter: (val: number) => `${fNumber(val)} pts` }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '80%',
          labels: {
            show: true,
            value: { formatter: (val: string) => fNumber(Number(val)) },
            total: {
              label: t('chatterpoints.hero.total-label'),
              formatter: () => fNumber(grandTotal)
            }
          }
        }
      }
    }
  })

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent='space-between'
      spacing={4}
    >
      {/* Left: heading + grand total */}
      <Box sx={{ maxWidth: 480, width: '100%' }}>
        <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 2 }}>
          <Typography
            variant='h1'
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: 32, md: 36 },
              letterSpacing: '-0.36px'
            }}
          >
            {t('chatterpoints.hero.title')}
          </Typography>
          <Chip
            label={t('products.hero.states.beta', 'beta')}
            size='small'
            sx={{
              fontWeight: 700,
              letterSpacing: 0.5,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main'
            }}
          />
        </Stack>

        <Typography
          variant='body1'
          sx={{
            color: 'text.primary',
            fontSize: 16,
            letterSpacing: '-0.16px',
            lineHeight: 1.5,
            mb: 3
          }}
        >
          {t('chatterpoints.hero.subtitle')}
        </Typography>

        {/* Grand total card — same grammar as the dashboard portfolio trigger */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            px: 2.5,
            py: 2,
            boxShadow: theme.customShadows.card,
            border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
            width: { xs: '100%', sm: 'auto' },
            minWidth: { sm: 300 }
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Iconify icon='solar:cup-star-bold-duotone' width={26} sx={{ color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography
              variant='caption'
              sx={{ display: 'block', color: 'text.secondary', fontWeight: 600 }}
            >
              {t('chatterpoints.hero.total-label')}
            </Typography>
            {loading ? (
              <Skeleton variant='text' width={96} sx={{ fontSize: theme.typography.h4.fontSize }} />
            ) : (
              <Typography variant='h4' fontWeight={700}>
                {fNumber(grandTotal)}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Right: breakdown donut — hidden on mobile, tiles below carry the values */}
      <Card
        sx={{
          p: 3,
          width: 360,
          height: 220,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          boxShadow: theme.customShadows.card,
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {t('chatterpoints.breakdown.title')}
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2, minHeight: 0 }}>
          {loading ? (
            <Stack alignItems='center' justifyContent='center' sx={{ width: '100%' }}>
              <Skeleton variant='circular' width={130} height={130} />
            </Stack>
          ) : hasPoints ? (
            <>
              <Box sx={{ flexShrink: 0 }}>
                <Chart
                  type='donut'
                  series={series}
                  options={chartOptions}
                  width={160}
                  height={160}
                />
              </Box>
              <Stack spacing={1.25} sx={{ minWidth: 0 }}>
                {CATEGORY_ORDER.map((key) => (
                  <Stack key={key} direction='row' alignItems='center' spacing={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: theme.palette[CATEGORY_META[key].color].main,
                        flexShrink: 0
                      }}
                    />
                    <Typography variant='caption' sx={{ color: 'text.secondary' }} noWrap>
                      {t(CATEGORY_META[key].labelKey)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          ) : (
            <Stack alignItems='center' justifyContent='center' spacing={1} sx={{ width: '100%' }}>
              <Iconify
                icon='solar:pie-chart-2-bold-duotone'
                width={40}
                sx={{ color: 'text.disabled' }}
              />
              <Typography variant='caption' sx={{ color: 'text.secondary', textAlign: 'center' }}>
                {t('chatterpoints.breakdown.empty')}
              </Typography>
            </Stack>
          )}
        </Box>
      </Card>
    </Stack>
  )
}
