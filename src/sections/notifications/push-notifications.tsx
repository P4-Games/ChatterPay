import React, { useState, useEffect } from 'react'
import { NotificationItem } from '@pushprotocol/uiweb'

import { Box, Card, Stack, Tooltip, Typography, IconButton, CircularProgress } from '@mui/material'

import { useTranslate } from 'src/locales'
import { AuthUserType } from 'src/auth/types'
import { useAuthContext } from 'src/auth/hooks'
import { useGetWalletNotifications } from 'src/app/api/_hooks'

import Iconify from 'src/components/iconify'

import { pushNotification } from 'src/types/notifications'

// ----------------------------------------------------------------------

const PushNotifications: React.FC = () => {
  const { t } = useTranslate()
  const { user }: { user: AuthUserType } = useAuthContext()
  // const { enqueueSnackbar } = useSnackbar()
  // const [notifications, setNotifications] = useState<any[]>([])
  // const [isLoading, setIsLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // const network = '421614'
  // const pushEnv: ENV = ENV.DEV

  useEffect(() => {
    if (user && user.wallet) {
      setWalletAddress(user.wallet)
    }
  }, [user])

  const { data, isLoading }: { data: any; isLoading: boolean } = useGetWalletNotifications(
    walletAddress || user?.wallet,
    5,
    0
  )
  const notifications = data ? data.flatMap((page: pushNotification) => page) : []

  /*
  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const data = await PushAPI.user.getFeeds({
        user: `eip155:${network}:${user?.wallet || ''}`,
        // user: 'eip155:421614:0x117b706DEF40310eF5926aB57868dAcf46605b8d',
        env: pushEnv,
        page: 1,
        limit: 10
      })

      if (JSON.stringify(data) !== JSON.stringify(notifications)) {
        setNotifications(data)
      }
    } catch (ex) {
      console.error(ex)
      enqueueSnackbar(`${t('account.notifications.msg.error')}`, { variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  */

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
        : notifications.map(
            (notification: pushNotification, index: React.Key | null | undefined) => {
              const { cta, title, message, app, icon, image, url, blockchain } = notification
              return (
                <NotificationItem
                  key={index}
                  notificationTitle={title}
                  notificationBody={message}
                  cta={cta}
                  app={app}
                  icon={icon}
                  image={image}
                  url={url}
                  theme='light'
                  chainName={blockchain}
                />
              )
            }
          )}
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

export default PushNotifications
