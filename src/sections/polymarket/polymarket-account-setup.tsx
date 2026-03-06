'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { alpha, useTheme } from '@mui/material/styles'

import { useTranslate } from 'src/locales'
import { useBoolean } from 'src/hooks/use-boolean'
import {
  polymarketAcceptTerms,
  polymarketCreateAccount
} from 'src/app/api/hooks'

import Iconify from 'src/components/iconify'

import type { IPolymarketAccountStatus } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type Props = {
  accountStatus: IPolymarketAccountStatus | null
  onAccountUpdated: () => void
}

export default function PolymarketAccountSetup({ accountStatus, onAccountUpdated }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const termsDialog = useBoolean()
  const [isCreating, setIsCreating] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already set up
  if (accountStatus?.has_account && accountStatus?.terms_accepted) {
    return null
  }

  const handleCreateAccount = async () => {
    setIsCreating(true)
    setError(null)
    try {
      const result = await polymarketCreateAccount()
      if (result.ok) {
        onAccountUpdated()
      } else {
        setError(result.message || t('polymarket.account-create-error'))
      }
    } catch {
      setError(t('polymarket.account-create-error'))
    } finally {
      setIsCreating(false)
    }
  }

  const handleAcceptTerms = async () => {
    setIsAccepting(true)
    setError(null)
    try {
      const result = await polymarketAcceptTerms()
      if (result.ok) {
        termsDialog.onFalse()
        onAccountUpdated()
      } else {
        setError(result.message || t('polymarket.terms-error'))
      }
    } catch {
      setError(t('polymarket.terms-error'))
    } finally {
      setIsAccepting(false)
    }
  }

  // No account yet
  if (!accountStatus?.has_account) {
    return (
      <Card
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.warning.main, 0.04)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
        }}
      >
        <Stack spacing={2.5} alignItems='center' sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.08)
            }}
          >
            <Iconify
              icon='solar:wallet-bold-duotone'
              width={32}
              sx={{ color: theme.palette.primary.main }}
            />
          </Box>

          <Box>
            <Typography variant='h6' gutterBottom>
              {t('polymarket.setup-title')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t('polymarket.setup-description')}
            </Typography>
          </Box>

          {error && (
            <Alert severity='error' sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          <Button
            variant='contained'
            size='large'
            onClick={handleCreateAccount}
            disabled={isCreating}
            startIcon={
              isCreating ? (
                <CircularProgress size={18} color='inherit' />
              ) : (
                <Iconify icon='solar:add-circle-bold' />
              )
            }
            sx={{ px: 4 }}
          >
            {isCreating ? t('polymarket.creating') : t('polymarket.create-wallet')}
          </Button>
        </Stack>
      </Card>
    )
  }

  // Account exists but terms not accepted
  return (
    <>
      <Card
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.04)} 0%, ${alpha(theme.palette.info.main, 0.04)} 100%)`,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.16)}`
        }}
      >
        <Stack spacing={2} alignItems='center' sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.warning.main, 0.08)
            }}
          >
            <Iconify
              icon='solar:document-bold-duotone'
              width={32}
              sx={{ color: theme.palette.warning.main }}
            />
          </Box>

          <Box>
            <Typography variant='h6' gutterBottom>
              {t('polymarket.terms-title')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t('polymarket.terms-description')}
            </Typography>
          </Box>

          {error && (
            <Alert severity='error' sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          <Button
            variant='contained'
            color='warning'
            size='large'
            onClick={termsDialog.onTrue}
            startIcon={<Iconify icon='solar:shield-check-bold' />}
            sx={{ px: 4 }}
          >
            {t('polymarket.accept-terms')}
          </Button>
        </Stack>
      </Card>

      {/* Terms Dialog */}
      <Dialog open={termsDialog.value} onClose={termsDialog.onFalse} maxWidth='sm' fullWidth>
        <DialogTitle>
          <Stack direction='row' alignItems='center' justifyContent='space-between'>
            <Typography variant='h6'>{t('polymarket.terms-dialog-title')}</Typography>
            <IconButton onClick={termsDialog.onFalse} size='small'>
              <Iconify icon='mingcute:close-line' />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant='body2'>
              {t('polymarket.terms-content-1')}
            </Typography>
            <Typography variant='body2'>
              {t('polymarket.terms-content-2')}
            </Typography>
            <Typography variant='body2'>
              {t('polymarket.terms-content-3')}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={termsDialog.onFalse} color='inherit'>
            {t('polymarket.cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleAcceptTerms}
            disabled={isAccepting}
            startIcon={
              isAccepting ? <CircularProgress size={18} color='inherit' /> : null
            }
          >
            {isAccepting ? t('polymarket.accepting') : t('polymarket.agree-continue')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
