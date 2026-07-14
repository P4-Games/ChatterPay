'use client'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
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

type AboutDialogProps = {
  open: boolean
  onClose: VoidFunction
  description: string
}

/**
 * "About this event" dialog showing the event description.
 * @param {AboutDialogProps} props - Open state, close handler and description text.
 * @returns {JSX.Element} The dialog.
 */
export function EventAboutDialog({ open, onClose, description }: AboutDialogProps) {
  const { t } = useTranslate()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{t('polymarket.about-event')}</DialogTitle>
      <DialogContent>
        <Typography variant='body2' sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {description}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          variant='contained'
          color='primary'
          sx={{ borderRadius: 50, textTransform: 'none', fontWeight: 600 }}
        >
          {t('polymarket.got-it')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
