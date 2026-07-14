'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import { useTheme } from '@mui/material/styles'

import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'
import { useSettingsContext } from 'src/components/settings'
import Iconify from 'src/components/iconify'

import type { IPolymarketMarket } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type BackdropProps = {
  children: React.ReactNode
}

/**
 * Full-height gradient background + container shared by the detail page's
 * loading and not-found states.
 * @param {BackdropProps} props - Content to render inside the container.
 * @returns {JSX.Element} The gradient page shell.
 */
function EventDetailBackdrop({ children }: BackdropProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const settings = useSettingsContext()

  return (
    <Box
      sx={{
        mt: -13,
        mx: { xs: 0, lg: -2 },
        flex: 1,
        background: isDark
          ? 'linear-gradient(180deg, #161C24 0%, #0A2E1A 100%)'
          : 'linear-gradient(180deg, #F4F6F8 0%, #B8F6C9 100%)',
        minHeight: '100vh',
        pb: 10
      }}
    >
      <Container
        maxWidth={settings.themeStretch ? false : 'xl'}
        sx={{ pt: { xs: 11, md: 12 }, px: { xs: 2, md: 3 } }}
      >
        {children}
      </Container>
    </Box>
  )
}

/**
 * Loading skeleton for the event detail page.
 * @returns {JSX.Element} Placeholder header and market-card grid.
 */
export function EventDetailSkeleton() {
  return (
    <EventDetailBackdrop>
      <Stack spacing={3}>
        <Skeleton variant='rounded' height={60} />
        <Skeleton variant='rounded' height={32} width={200} />
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid xs={12} sm={6} md={4} key={i}>
              <Skeleton variant='rounded' height={340} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </EventDetailBackdrop>
  )
}

/**
 * Not-found state with a back-to-markets action.
 * @returns {JSX.Element} Centered message and back button.
 */
export function EventDetailNotFound() {
  const { t } = useTranslate()
  const router = useRouter()

  return (
    <EventDetailBackdrop>
      <Stack alignItems='center' justifyContent='center' sx={{ py: 10 }}>
        <Typography variant='h6' color='text.secondary'>
          {t('polymarket.event-not-found')}
        </Typography>
        <Button
          onClick={() => router.push(paths.dashboard.polymarket.root)}
          startIcon={<Iconify icon='eva:arrow-back-fill' />}
          sx={{ mt: 2 }}
        >
          {t('polymarket.back-to-markets')}
        </Button>
      </Stack>
    </EventDetailBackdrop>
  )
}

// ----------------------------------------------------------------------

type RulesDrawerProps = {
  open: boolean
  onClose: VoidFunction
  /** Event-level description shown at the top (optional) */
  description?: string
  markets: IPolymarketMarket[]
}

/**
 * Side drawer with the event description and every market's resolution rules
 * (e.g. sports: result within the first 90 minutes of regular play). Single
 * entry point for all event/market conditions — neutral styling so it stays
 * available without competing with the trading UI.
 * @param {RulesDrawerProps} props - Open state, close handler, event description and markets.
 * @returns {JSX.Element} The drawer.
 */
export function EventRulesDrawer({ open, onClose, description, markets }: RulesDrawerProps) {
  const { t } = useTranslate()

  const marketsWithRules = markets.filter((m) => m.description)

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}
    >
      <Stack
        direction='row'
        alignItems='center'
        justifyContent='space-between'
        sx={{ px: 3, py: 2 }}
      >
        <Typography variant='h6' sx={{ fontWeight: 700 }}>
          {t('polymarket.market-rules')}
        </Typography>
        <IconButton onClick={onClose} edge='end'>
          <Iconify icon='eva:close-fill' width={20} />
        </IconButton>
      </Stack>

      <Divider />

      <Stack spacing={3} sx={{ px: 3, py: 2.5, overflowY: 'auto' }}>
        {description && (
          <Box>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 0.5 }}>
              {t('polymarket.about-event')}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}
            >
              {description}
            </Typography>
          </Box>
        )}

        {marketsWithRules.map((market) => (
          <Box key={market.condition_id || market.slug}>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 0.5 }}>
              {market.group_item_title || market.question}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}
            >
              {market.description}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Drawer>
  )
}
