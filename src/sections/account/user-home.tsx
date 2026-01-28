import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import Grid from '@mui/material/Unstable_Grid2'
import { useSecurityStatus } from 'src/app/api/hooks/use-security'
import { useAuthContext } from 'src/auth/hooks'
import Iconify from 'src/components/iconify'
import { useTranslate } from 'src/locales'
import { paths } from 'src/routes/paths'

// ----------------------------------------------------------------------

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

  const securityStatusColor = hasSecurityError
    ? theme.palette.error.main
    : hasSecurityWarning
      ? theme.palette.warning.main
      : theme.palette.success.main
  const securityStatusIcon =
    hasSecurityError || hasSecurityWarning ? 'eva:alert-circle-fill' : 'eva:checkmark-fill'

  const showSecurityStatus = !!pinStatus
  const profileStatusColor = emailConfigured
    ? theme.palette.success.main
    : theme.palette.warning.main
  const profileStatusIcon = emailConfigured ? 'eva:checkmark-fill' : 'eva:alert-circle-fill'

  const renderStatusBadge = (color: string, icon: string) => (
    <Box
      sx={{
        mt: 0.5,
        mr: 0.5,
        width: 24,
        height: 24,
        borderRadius: '50%',
        bgcolor: color,
        color: 'common.white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Iconify icon={icon} width={16} />
    </Box>
  )
  return (
    <Grid container spacing={3} alignItems='stretch'>
      <Grid xs={12} md={4}>
        <Card sx={{ height: '100%', minHeight: 180 }}>
          <CardActionArea
            href={paths.dashboard.user.profile}
            sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}
          >
            <CardHeader
              avatar={<Iconify icon='eva:person-fill' width={24} />}
              title={t('user.cards.profile.title')}
              subheader={t('user.cards.profile.description')}
              action={renderStatusBadge(profileStatusColor, profileStatusIcon)}
              sx={{ flex: 1 }}
              subheaderTypographyProps={{
                sx: {
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }
              }}
            />
          </CardActionArea>
        </Card>
      </Grid>

      <Grid xs={12} md={4}>
        <Card sx={{ height: '100%', minHeight: 180 }}>
          <CardActionArea
            href={paths.dashboard.user.security}
            sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}
          >
            <CardHeader
              avatar={<Iconify icon='eva:lock-fill' width={24} />}
              title={t('user.cards.security.title')}
              subheader={t('user.cards.security.description')}
              action={
                showSecurityStatus
                  ? renderStatusBadge(securityStatusColor, securityStatusIcon)
                  : null
              }
              sx={{ flex: 1 }}
              subheaderTypographyProps={{
                sx: {
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }
              }}
            />
          </CardActionArea>
        </Card>
      </Grid>

      <Grid xs={12} md={4}>
        <Card sx={{ height: '100%', minHeight: 180 }}>
          <CardActionArea
            href={paths.dashboard.user.referrals}
            sx={{ height: '100%', display: 'flex', alignItems: 'stretch' }}
          >
            <CardHeader
              avatar={<Iconify icon='eva:people-fill' width={24} />}
              title={t('user.cards.referrals.title')}
              subheader={t('user.cards.referrals.description')}
              sx={{ flex: 1 }}
              subheaderTypographyProps={{
                sx: {
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }
              }}
            />
          </CardActionArea>
        </Card>
      </Grid>
    </Grid>
  )
}
