import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { fNumber } from 'src/utils/format-number'
import Iconify from 'src/components/iconify'

import type { ChatterpointsHistoryResult } from 'src/types/chatterpoints'

import { CATEGORY_META, CATEGORY_ORDER } from './chatterpoints-config'

// ----------------------------------------------------------------------

type Props = {
  totals: ChatterpointsHistoryResult['totals']
  loading: boolean
}

/**
 * Per-category point tiles (games / operations / social), styled after the
 * polymarket stat cards: icon chip, caption label, bold number.
 * @param {Props} props - Totals per category and loading flag.
 * @returns {JSX.Element} Row of category stat cards.
 */
export default function ChatterpointsStats({ totals, loading }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()

  return (
    <Grid container spacing={3}>
      {CATEGORY_ORDER.map((key) => {
        const meta = CATEGORY_META[key]
        const paletteColor = theme.palette[meta.color]

        return (
          <Grid key={key} xs={12} sm={4}>
            <Card
              sx={{
                p: 2.5,
                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                boxShadow: theme.customShadows.card
              }}
            >
              <Stack direction='row' alignItems='center' spacing={2}>
                <Stack
                  alignItems='center'
                  justifyContent='center'
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    bgcolor: alpha(paletteColor.main, 0.08),
                    flexShrink: 0
                  }}
                >
                  <Iconify icon={meta.icon} width={24} sx={{ color: paletteColor.main }} />
                </Stack>

                <Stack sx={{ minWidth: 0 }}>
                  <Typography
                    variant='caption'
                    sx={{ color: 'text.secondary', fontWeight: 600 }}
                    noWrap
                  >
                    {t(meta.labelKey)}
                  </Typography>
                  {loading ? (
                    <Skeleton
                      variant='text'
                      width={64}
                      sx={{ fontSize: theme.typography.h5.fontSize }}
                    />
                  ) : (
                    <Typography variant='h5' fontWeight={700}>
                      {fNumber(totals?.[key] ?? 0)}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}
