import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Unstable_Grid2'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import { alpha, useTheme } from '@mui/material/styles'

import { paths } from 'src/routes/paths'
import { useTranslate } from 'src/locales'
import { useAuthContext } from 'src/auth/hooks'
import { useSecurityStatus } from 'src/app/api/hooks/use-security'
import Iconify from 'src/components/iconify'

import type { ColorSchema } from 'src/theme/palette'

// ----------------------------------------------------------------------

type HubCard = {
  href: string
  icon: string
  color: ColorSchema
  title: string
  description: string
  status?: {
    label: string
    color: 'success' | 'warning' | 'error'
  }
}

/**
 * User hub: entry cards for profile, security and referrals with
 * configuration status chips. Styled after the system card grammar.
 * @returns {JSX.Element} Hub card grid.
 */
export default function UserHome() {
  const { t } = useTranslate()
  const theme = useTheme()
  const { user } = useAuthContext()
  const { data: securityResponse } = useSecurityStatus(user?.id)

  const securityStatus = securityResponse?.ok ? securityResponse.data : null
  const pinStatus = securityStatus?.pinStatus
  const emailConfigured = !!(user?.email || '').trim()
  const recoveryConfigured = !!securityStatus?.recoveryQuestionsSet
  const hasSecurityError = pinStatus === 'blocked'
  const hasSecurityWarning =
    !hasSecurityError &&
    (pinStatus === 'not_set' || pinStatus === 'reset_required' || !recoveryConfigured)

  const cards: HubCard[] = [
    {
      href: paths.dashboard.user.profile,
      icon: 'solar:user-id-bold-duotone',
      color: 'primary',
      title: t('user.cards.profile.title'),
      description: t('user.cards.profile.description'),
      status: {
        label: emailConfigured
          ? t('user.cards.security.badge.configured')
          : t('user.cards.security.badge.actionRequired'),
        color: emailConfigured ? 'success' : 'warning'
      }
    },
    {
      href: paths.dashboard.user.security,
      icon: 'solar:shield-keyhole-bold-duotone',
      color: 'info',
      title: t('user.cards.security.title'),
      description: t('user.cards.security.description'),
      status: pinStatus
        ? {
            label:
              hasSecurityError || hasSecurityWarning
                ? t('user.cards.security.badge.actionRequired')
                : t('user.cards.security.badge.configured'),
            color: hasSecurityError ? 'error' : hasSecurityWarning ? 'warning' : 'success'
          }
        : undefined
    },
    {
      href: paths.dashboard.user.referrals,
      icon: 'solar:users-group-rounded-bold-duotone',
      color: 'warning',
      title: t('user.cards.referrals.title'),
      description: t('user.cards.referrals.description')
    }
  ]

  return (
    <Grid container spacing={3} alignItems='stretch'>
      {cards.map((card) => {
        const paletteColor = theme.palette[card.color]

        return (
          <Grid key={card.href} xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                boxShadow: theme.customShadows.card,
                transition: 'all 0.18s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.customShadows.z20
                }
              }}
            >
              <CardActionArea href={card.href} sx={{ height: '100%', p: 3 }}>
                <Stack spacing={2} sx={{ height: '100%' }}>
                  <Stack direction='row' alignItems='flex-start' justifyContent='space-between'>
                    <Stack
                      alignItems='center'
                      justifyContent='center'
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.5,
                        bgcolor: alpha(paletteColor.main, 0.08)
                      }}
                    >
                      <Iconify icon={card.icon} width={26} sx={{ color: paletteColor.main }} />
                    </Stack>

                    {card.status && (
                      <Box
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: 0.75,
                          bgcolor: alpha(theme.palette[card.status.color].main, 0.12),
                          color: `${card.status.color}.main`,
                          typography: 'caption',
                          fontWeight: 700
                        }}
                      >
                        {card.status.label}
                      </Box>
                    )}
                  </Stack>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 0.5 }}>
                      {card.title}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {card.description}
                    </Typography>
                  </Box>

                  <Stack direction='row' alignItems='center' spacing={0.5}>
                    <Typography variant='caption' sx={{ color: 'primary.main', fontWeight: 600 }}>
                      {t('common.view')}
                    </Typography>
                    <Iconify
                      icon='eva:arrow-ios-forward-fill'
                      width={16}
                      sx={{ color: 'primary.main' }}
                    />
                  </Stack>
                </Stack>
              </CardActionArea>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}
