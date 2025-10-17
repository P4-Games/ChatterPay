import Image from 'next/image'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import { CardProps } from '@mui/material/Card'

import { useTranslate } from 'src/locales'

import AnalyticsWidgetSummary from './analitycs-widget-summary'

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title?: string
  subheader?: string
  tableData: {
    totals: {
      games: number
      operations: number
      social: number
      grandTotal: number
    }
  }
  loading?: boolean
}

export default function ChatterpointWidget({ tableData, loading = false, ...other }: Props) {
  const { t } = useTranslate()

  const totals = tableData?.totals || {
    games: 0,
    operations: 0,
    social: 0,
    grandTotal: 0
  }

  return (
    <Box {...other}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Chip
          label={t('products.hero.states.beta', 'total')}
          size='small'
          sx={{
            fontWeight: 'bold',
            letterSpacing: 0.5,
            bgcolor: 'warning.light',
            color: 'warning.dark'
          }}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <AnalyticsWidgetSummary
            title={t('chatterpoints.totals.total', 'total')}
            total={totals.grandTotal || 0}
            icon={
              <Image
                src='/assets/icons/chatterpoints/ic_total.svg'
                alt='total'
                width={60}
                height={60}
              />
            }
            color='primary'
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <AnalyticsWidgetSummary
            title={t('chatterpoints.totals.games', 'games')}
            total={totals.games || 0}
            icon={
              <Image
                src='/assets/icons/chatterpoints/ic_games.svg'
                alt='games'
                width={60}
                height={60}
              />
            }
            color='info'
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <AnalyticsWidgetSummary
            title={t('chatterpoints.totals.operations', 'operations')}
            total={totals.operations || 0}
            icon={
              <Image
                src='/assets/icons/chatterpoints/ic_operations.svg'
                alt='operations'
                width={60}
                height={60}
              />
            }
            color='success'
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <AnalyticsWidgetSummary
            title={t('chatterpoints.totals.social', 'social networks')}
            total={totals.social || 0}
            icon={
              <Image
                src='/assets/icons/chatterpoints/ic_social.svg'
                alt='social'
                width={60}
                height={60}
              />
            }
            color='warning'
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
