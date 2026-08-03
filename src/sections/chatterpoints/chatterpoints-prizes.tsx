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

import type { UserPrize } from 'src/types/chatterpoints'

// ----------------------------------------------------------------------

// Medal tints: gold / silver / bronze
const RANK_COLORS = ['#F5B301', '#9EA4AE', '#C77B4F']

type Props = {
  prizes: UserPrize[]
  loading: boolean
}

/**
 * Cycle prizes card: one row per podium finish (rank, points, prize, cycle end).
 * @param {Props} props - Prizes won by the user and loading flag.
 * @returns {JSX.Element} Prizes card.
 */
export default function ChatterpointsPrizes({ prizes, loading }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()

  const sorted = [...(prizes ?? [])].sort(
    (a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime()
  )

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
      <Typography variant='subtitle1' fontWeight={700} sx={{ px: 3, pt: 3, pb: 2 }}>
        {t('chatterpoints.prizes.title')}
      </Typography>

      {loading ? (
        <Stack spacing={0.5} sx={{ px: 3, pb: 3 }}>
          {[...Array(2)].map((_, index) => (
            <Stack key={index} direction='row' alignItems='center' spacing={2} sx={{ py: 1.25 }}>
              <Skeleton variant='rounded' width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant='text' width='50%' />
                <Skeleton variant='text' width='30%' />
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : sorted.length === 0 ? (
        <Stack
          alignItems='center'
          justifyContent='center'
          spacing={1.5}
          sx={{ px: 3, py: 8, flexGrow: 1 }}
        >
          <Iconify
            icon='solar:medal-star-bold-duotone'
            width={48}
            sx={{ color: 'text.disabled' }}
          />
          <Typography variant='subtitle2'>{t('chatterpoints.prizes.empty-title')}</Typography>
          <Typography
            variant='body2'
            sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 280 }}
          >
            {t('chatterpoints.prizes.empty-description')}
          </Typography>
        </Stack>
      ) : (
        <Stack sx={{ px: 1.5, pb: 2 }}>
          {sorted.map((prize) => {
            const medalColor = RANK_COLORS[prize.rank - 1] ?? RANK_COLORS[2]

            return (
              <Stack
                key={`${prize.cycleId}-${prize.rank}`}
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
                    bgcolor: alpha(medalColor, 0.12),
                    flexShrink: 0
                  }}
                >
                  <Iconify
                    icon='solar:medal-star-bold-duotone'
                    width={24}
                    sx={{ color: medalColor }}
                  />
                </Stack>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant='subtitle2' fontWeight={600} noWrap>
                    {t('chatterpoints.prizes.rank', { rank: prize.rank })}
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }} noWrap>
                    {`${fNumber(prize.totalPoints)} pts · ${fDate(prize.endAt)}`}
                  </Typography>
                </Box>

                <Typography variant='subtitle2' fontWeight={700} sx={{ flexShrink: 0 }}>
                  +{fNumber(prize.prize)}
                </Typography>
              </Stack>
            )
          })}
        </Stack>
      )}
    </Card>
  )
}
