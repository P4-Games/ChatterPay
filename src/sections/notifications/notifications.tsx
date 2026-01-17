import type React from 'react'
import { useState, useEffect } from 'react'

import { Box, Card, Stack, Tooltip, Typography, IconButton, CircularProgress } from '@mui/material'

import { useTranslate } from 'src/locales'
import type { AuthUserType } from 'src/auth/types'
import { useAuthContext } from 'src/auth/hooks'
import { useGetWalletNotifications } from 'src/app/api/hooks'
import { notificationsRefreshInterval } from 'src/config-global'

import Iconify from 'src/components/iconify'

import type { Notification } from 'src/types/notifications'

// ----------------------------------------------------------------------

const Notifications: React.FC = () => {
  const { t } = useTranslate()
  const { user }: { user: AuthUserType } = useAuthContext()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.walletEOA) {
      setWalletAddress(user.walletEOA)
    }
  }, [user])

  const { data, isLoading }: { data: any; isLoading: boolean } = useGetWalletNotifications(
    walletAddress || user?.walletEOA,
    5,
    notificationsRefreshInterval
  )
  const notifications = data ? data.flatMap((page: Notification) => page) : []

  const renderTitle = (
    <Stack
      direction='row'
      alignItems='center'
      spacing={1}
      sx={{ mt: 0, justifyContent: 'flex-end' }}
    >
      <Tooltip title={t('account.notifications.refresh')} arrow>
        <IconButton color='primary'>
          <Iconify icon='mdi:refresh' />
        </IconButton>
      </Tooltip>
    </Stack>
  )

  const renderNoNotifications = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        textAlign: 'center',
        color: 'text.secondary'
      }}
    >
      <Iconify icon='mdi:bell-off-outline' width={48} height={48} color='text.secondary' />
      <Typography variant='h6' sx={{ mt: 2 }}>
        {t('account.notifications.msgs.no-notifications')}
      </Typography>
    </Box>
  )

  const renderNotifications = (
    <Stack spacing={2} sx={{ mt: 0 }}>
      {!notifications || notifications.length === 0
        ? renderNoNotifications
        : notifications.map((notification: Notification, index: React.Key | null | undefined) => {
            const { cta, title, message, app, icon, image, url, blockchain } = notification
            return <></>
          })}
    </Stack>
  )

  return (
    <Card sx={{ p: 3, minHeight: '100vh' }}>
      {renderTitle}
      {isLoading ? (
        <Stack direction='row' justifyContent='center' sx={{ mt: 4 }}>
          <CircularProgress />
        </Stack>
      ) : (
        renderNotifications
      )}
    </Card>
  )
}

export default Notifications
