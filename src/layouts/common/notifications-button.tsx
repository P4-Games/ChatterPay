import { m } from 'framer-motion'
import { useState } from 'react'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Badge, { badgeClasses } from '@mui/material/Badge'
import type { Theme, SxProps } from '@mui/material/styles'

import { useAuthContext } from 'src/auth/hooks'
import { useGetNotifications } from 'src/app/api/hooks/use-notifications'

import Iconify from 'src/components/iconify'
import { varHover } from 'src/components/animate'

import NotificationsModal from '../common/notifications-modal'

// ----------------------------------------------------------------------

type Props = {
  sx?: SxProps<Theme>
}

export default function NotificationsButton({ sx }: Props) {
  const { user } = useAuthContext()
  const [open, setOpen] = useState(false)

  const { unreadCount } = useGetNotifications(user?.id || '')

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const hasUnread = unreadCount > 0

  return (
    <>
      <Badge
        badgeContent={unreadCount}
        color='success'
        max={99}
        invisible={!hasUnread}
        sx={{
          [`& .${badgeClasses.badge}`]: {
            top: 6,
            right: 6,
            height: 18,
            minWidth: 18,
            fontSize: 10,
            fontWeight: 'bold',
            padding: '0 4px'
          },
          ...sx
        }}
      >
        <Box
          component={m.div}
          animate={
            hasUnread
              ? {
                  scale: [1, 1.1, 1],
                  filter: [
                    'drop-shadow(0 0 0px rgba(0, 216, 86, 0))',
                    'drop-shadow(0 0 8px rgba(0, 216, 86, 0.8))',
                    'drop-shadow(0 0 0px rgba(0, 216, 86, 0))'
                  ]
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut'
          }}
          sx={{
            position: 'relative',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <IconButton
            component={m.button as any}
            whileTap='tap'
            whileHover='hover'
            variants={varHover(1.05)}
            onClick={handleOpen}
            sx={{
              width: 40,
              height: 40,
              color: hasUnread ? 'primary.main' : 'text.secondary'
            }}
          >
            <Iconify icon='solar:bell-bing-bold-duotone' width={24} />
          </IconButton>

          {hasUnread && (
            <Box
              component={m.div}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
                position: 'absolute',
                top: 8,
                right: 8,
                border: (theme) => `solid 2px ${theme.palette.background.paper}`,
                zIndex: 1
              }}
            />
          )}
        </Box>
      </Badge>

      <NotificationsModal open={open} onClose={handleClose} />
    </>
  )
}
