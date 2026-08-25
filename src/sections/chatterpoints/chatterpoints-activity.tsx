import { useMemo } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { fDate } from 'src/utils/format-time'
import { fNumber } from 'src/utils/format-number'
import Iconify from 'src/components/iconify'

import type { ChatterpointsHistoryResult } from 'src/types/chatterpoints'

import { CATEGORY_META, formatRawLabel } from './chatterpoints-config'
import type { ChatterpointsCategory } from './chatterpoints-config'

// ----------------------------------------------------------------------

const MAX_ENTRIES = 10

type ActivityEntry = {
  key: string
  category: ChatterpointsCategory
  title: string
  subtitle: string
  points: number
  at: string
  won?: boolean
}

type Props = {
  summary: ChatterpointsHistoryResult
  loading: boolean
}

/**
 * Unified activity ledger: merges game plays, operations and social actions
 * into one reverse-chronological list with category-coded icon chips.
 * @param {Props} props - Full history summary and loading flag.
 * @returns {JSX.Element} Activity card.
 */
export default function ChatterpointsActivity({ summary, loading }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()

  const entries = useMemo<ActivityEntry[]>(() => {
    const games: ActivityEntry[] = (summary?.games ?? []).map((play, index) => ({
      key: `game-${play.gameId}-${play.at}-${index}`,
      category: 'games',
      title: formatRawLabel(play.gameType),
      subtitle: play.won ? t('chatterpoints.activity.won') : t('chatterpoints.activity.played'),
      points: play.points,
      at: play.at,
      won: play.won
    }))

    const operations: ActivityEntry[] = (summary?.operations ?? []).map((op, index) => ({
      key: `op-${op.type}-${op.at}-${index}`,
      category: 'operations',
      title: formatRawLabel(op.type),
      subtitle: op.amount ? `$${fNumber(op.amount)}` : (op.userLevel ?? ''),
      points: op.points,
      at: op.at
    }))

    const social: ActivityEntry[] = (summary?.social ?? []).map((action, index) => ({
      key: `social-${action.platform}-${action.at}-${index}`,
      category: 'social',
      title: formatRawLabel(action.platform),
      subtitle: formatRawLabel(action.action),
      points: action.points,
      at: action.at
    }))

    return [...games, ...operations, ...social]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, MAX_ENTRIES)
  }, [summary, t])

  const windowLabel =
    summary?.window?.from && summary?.window?.to
      ? `${fDate(summary.window.from)} — ${fDate(summary.window.to)}`
      : ''

  return (
    <Card
      sx={{
        border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
        boxShadow: theme.customShadows.card,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        sx={{ px: 3, pt: 3, pb: 2 }}
      >
        <Typography variant='subtitle1' fontWeight={700}>
          {t('chatterpoints.activity.title')}
        </Typography>
        {windowLabel && (
          <Typography variant='caption' sx={{ color: 'text.disabled' }}>
            {windowLabel}
          </Typography>
        )}
      </Stack>

      {loading ? (
        <Stack spacing={0.5} sx={{ px: 3, pb: 3 }}>
          {[...Array(4)].map((_, index) => (
            <Stack key={index} direction='row' alignItems='center' spacing={2} sx={{ py: 1.25 }}>
              <Skeleton variant='rounded' width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant='text' width='40%' />
                <Skeleton variant='text' width='24%' />
              </Box>
              <Skeleton variant='rounded' width={56} height={24} />
            </Stack>
          ))}
        </Stack>
      ) : entries.length === 0 ? (
        <Stack alignItems='center' justifyContent='center' spacing={1.5} sx={{ px: 3, py: 8 }}>
          <Iconify icon='solar:history-bold-duotone' width={48} sx={{ color: 'text.disabled' }} />
          <Typography variant='subtitle2'>{t('chatterpoints.activity.empty-title')}</Typography>
          <Typography
            variant='body2'
            sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 320 }}
          >
            {t('chatterpoints.activity.empty-description')}
          </Typography>
        </Stack>
      ) : (
        <Stack sx={{ px: 1.5, pb: 2 }}>
          {entries.map((entry) => {
            const meta = CATEGORY_META[entry.category]
            const paletteColor = theme.palette[meta.color]

            return (
              <Stack
                key={entry.key}
                direction='row'
                alignItems='center'
                spacing={2}
                sx={{
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 1,
                  transition: theme.transitions.create('background-color', { duration: 200 }),
                  '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.04) }
                }}
              >
                <Stack
                  alignItems='center'
                  justifyContent='center'
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: alpha(paletteColor.main, 0.08),
                    flexShrink: 0
                  }}
                >
                  <Iconify icon={meta.icon} width={22} sx={{ color: paletteColor.main }} />
                </Stack>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant='subtitle2' fontWeight={600} noWrap>
                    {entry.title}
                  </Typography>
                  {entry.subtitle && (
                    <Typography
                      variant='caption'
                      sx={{
                        color: entry.won ? 'success.main' : 'text.secondary',
                        fontWeight: entry.won ? 600 : 400
                      }}
                      noWrap
                    >
                      {entry.subtitle}
                    </Typography>
                  )}
                </Box>

                <Stack alignItems='flex-end' spacing={0.25} sx={{ flexShrink: 0 }}>
                  <Box
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 0.75,
                      bgcolor: alpha(theme.palette.success.main, 0.12),
                      color: 'success.main',
                      typography: 'caption',
                      fontWeight: 700
                    }}
                  >
                    +{fNumber(entry.points)}
                  </Box>
                  <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                    {fDate(entry.at)}
                  </Typography>
                </Stack>
              </Stack>
            )
          })}
        </Stack>
      )}
    </Card>
  )
}
