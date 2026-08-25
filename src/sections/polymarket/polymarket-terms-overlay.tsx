'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { alpha, useTheme } from '@mui/material/styles'

import { useRouter } from 'src/routes/hooks'
import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'
import { polymarketAcceptTerms } from 'src/app/api/hooks'

import Iconify from 'src/components/iconify'

import type { IPolymarketTerms } from 'src/types/polymarket'

// ----------------------------------------------------------------------

type Props = {
  terms: IPolymarketTerms
  onAccepted: () => void
}

export default function PolymarketTermsOverlay({ terms, onAccepted }: Props) {
  const { t } = useTranslate()
  const theme = useTheme()
  const router = useRouter()
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDark = theme.palette.mode === 'dark'

  const handleAccept = async () => {
    setIsAccepting(true)
    setError(null)
    try {
      const result = await polymarketAcceptTerms(terms.version)
      if (result.ok) {
        onAccepted()
      } else {
        setError(result.message || t('polymarket.terms-error'))
      }
    } catch {
      setError(t('polymarket.terms-error'))
    } finally {
      setIsAccepting(false)
    }
  }

  const handleCancel = () => {
    router.push(paths.dashboard.root)
  }

  return (
    /* Fixed overlay — sits on top of everything including sidebar */
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: theme.zIndex.modal,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        // Blurred, semi-transparent backdrop
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: isDark
          ? alpha(theme.palette.grey[900], 0.72)
          : alpha(theme.palette.grey[300], 0.55)
      }}
    >
      <Card
        sx={{
          maxWidth: 560,
          width: '100%',
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          // Theme-aware: white in light mode, dark surface in dark mode
          bgcolor: isDark ? theme.palette.grey[900] : theme.palette.common.white,
          boxShadow: theme.shadows[24],
          border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
        }}
      >
        <Stack spacing={3} alignItems='center' sx={{ textAlign: 'center' }}>
          {/* Icon badge */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }}
          >
            <Iconify
              icon='solar:document-bold-duotone'
              width={32}
              sx={{ color: theme.palette.primary.main }}
            />
          </Box>

          {/* Title */}
          <Typography variant='h5' sx={{ fontWeight: 700 }}>
            {t('polymarket.terms-dialog-title')}
          </Typography>

          {/* Scrollable terms body */}
          <Box
            sx={{
              maxHeight: 280,
              overflow: 'auto',
              width: '100%',
              textAlign: 'left',
              px: 1,
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
              p: 2,
              bgcolor: isDark
                ? alpha(theme.palette.grey[800], 0.5)
                : alpha(theme.palette.grey[100], 0.8),
              // Styled scrollbar
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { borderRadius: 3, bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.grey[500], 0.32)
              }
            }}
          >
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}
            >
              {terms.content}
            </Typography>
          </Box>

          {/* Error alert */}
          {error && (
            <Alert severity='error' sx={{ width: '100%', borderRadius: 1.5 }}>
              {error}
            </Alert>
          )}

          {/* Actions */}
          <Stack direction='row' spacing={2} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant='outlined'
              color='inherit'
              size='large'
              onClick={handleCancel}
              disabled={isAccepting}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                borderColor: alpha(theme.palette.grey[500], 0.32),
                color: 'text.secondary',
                '&:hover': {
                  borderColor: theme.palette.grey[500],
                  bgcolor: alpha(theme.palette.grey[500], 0.08)
                }
              }}
            >
              {t('polymarket.cancel')}
            </Button>

            <Button
              fullWidth
              variant='contained'
              size='large'
              onClick={handleAccept}
              disabled={isAccepting}
              startIcon={isAccepting ? <CircularProgress size={18} color='inherit' /> : null}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                // Force the main green regardless of theme palette
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark
                },
                '&.Mui-disabled': {
                  bgcolor: alpha(theme.palette.primary.main, 0.48),
                  color: alpha(theme.palette.primary.contrastText, 0.48)
                }
              }}
            >
              {isAccepting ? t('polymarket.accepting') : t('polymarket.agree-continue')}
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Box>
  )
}
