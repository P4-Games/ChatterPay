import { useRef, useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import DialogContent from '@mui/material/DialogContent'

import { fDateTime } from 'src/utils/format-time'
import { useAuthContext } from 'src/auth/hooks'
import {
  useGetNotifications,
  useMarkNotificationsAsRead,
  useDeleteNotification
} from 'src/app/api/hooks/use-notifications'
import { useTranslate } from 'src/locales'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'
import Scrollbar from 'src/components/scrollbar'
import EmptyContent from 'src/components/empty-content'

// ----------------------------------------------------------------------

type Props = {
  open: boolean
  onClose: VoidFunction
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g

export default function NotificationsModal({ open, onClose }: Props) {
  const { t } = useTranslate()
  const { user } = useAuthContext()
  const observerRef = useRef<HTMLDivElement>(null)

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const { notifications, hasMore, isLoading, isLoadingMore, loadMore, mutate } =
    useGetNotifications(user?.id || '')
  const markAsRead = useMarkNotificationsAsRead(user?.id || '')
  const deleteNotification = useDeleteNotification(user?.id || '')

  // Mark all as read when modal opens
  useEffect(() => {
    if (open && user?.id) {
      markAsRead()
        .then(() => {
          mutate()
        })
        .catch((error) => {
          console.error('Error marking notifications as read:', error)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id])

  // Native Intersection Observer for infinite scroll
  useEffect(() => {
    if (!open || !hasMore || isLoadingMore || isLoading) return

    let observer: IntersectionObserver | null = null

    // Small delay to ensure DOM is rendered
    const timeoutId = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
            loadMore()
          }
        },
        {
          threshold: 0,
          rootMargin: '100px'
        }
      )

      const currentTarget = observerRef.current
      if (currentTarget) {
        observer.observe(currentTarget)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [open, hasMore, isLoadingMore, isLoading, loadMore, notifications.length])

  const handleDelete = useCallback(
    async (notificationId: string) => {
      try {
        setDeletingIds((prev) => new Set(prev).add(notificationId))
        await deleteNotification(notificationId)

        setTimeout(() => {
          mutate()
          setDeletingIds((prev) => {
            const next = new Set(prev)
            next.delete(notificationId)
            return next
          })
        }, 1000)
      } catch (error) {
        setDeletingIds((prev) => {
          const next = new Set(prev)
          next.delete(notificationId)
          return next
        })
        console.error('Error deleting notification:', error)
      }
    },
    [deleteNotification, mutate]
  )

  const renderMessage = (message: string) => {
    const parts = message.split(URL_REGEX)
    return parts.map((part, i) => {
      if (part.match(URL_REGEX)) {
        return (
          <Box key={i} component='span' sx={{ display: 'block', mt: 0.5 }}>
            <Link
              href={part}
              target='_blank'
              rel='noopener'
              sx={{ wordBreak: 'break-all', fontWeight: 'bold' }}
            >
              {part}
            </Link>
          </Box>
        )
      }
      return part
    })
  }

  const getIconProps = (notification: any) => {
    if (
      notification.template === 'incoming_transfer' ||
      notification.template === 'incoming_transfer_external'
    ) {
      return {
        icon: 'eva:diagonal-arrow-left-down-fill',
        color: 'success.main',
        bgcolor: (theme: any) => alpha(theme.palette.success.main, 0.12),
        size: 24
      }
    }
    if (notification.template === 'outgoing_transfer') {
      return {
        icon: 'eva:diagonal-arrow-right-up-fill',
        color: 'error.main',
        bgcolor: (theme: any) => alpha(theme.palette.error.main, 0.12),
        size: 24
      }
    }
    if (notification.media === 'WHATSAPP') {
      return {
        icon: 'logos:whatsapp-icon',
        color: 'success.main',
        bgcolor: (theme: any) => alpha(theme.palette.success.main, 0.08),
        size: 20
      }
    }
    return {
      icon: 'solar:info-circle-bold',
      color: 'info.main',
      bgcolor: (theme: any) => alpha(theme.palette.info.main, 0.08),
      size: 24
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          height: { xs: '100%', sm: 600 }
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6'>{t('account.notifications.title')}</Typography>
          <IconButton onClick={onClose}>
            <Iconify icon='mingcute:close-line' />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <DialogContent sx={{ p: 0, px: { xs: 1, sm: 2 } }}>
        <Scrollbar
          sx={{
            height: 1,
            '& .simplebar-content': {
              height: 1,
              display: 'flex',
              flexDirection: 'column'
            }
          }}
        >
          {notifications.length === 0 && !isLoading ? (
            <EmptyContent
              filled
              title={t('account.notifications.empty-title')}
              description={t('account.notifications.empty-description')}
              sx={{
                py: 10
              }}
            />
          ) : (
            <Stack spacing={0}>
              {notifications.map((notification, index) => {
                const iconProps = getIconProps(notification)
                const isDeleting = deletingIds.has(notification._id)

                return (
                  <Box key={notification._id} sx={{ position: 'relative' }}>
                    <Stack
                      direction='row'
                      spacing={2}
                      sx={{
                        px: { xs: 1.5, sm: 2 },
                        py: 2,
                        opacity: isDeleting ? 0.4 : 1,
                        transition: 'opacity 0.2s',
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08)
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: iconProps.bgcolor,
                          color: iconProps.color,
                          flexShrink: 0
                        }}
                      >
                        <Iconify icon={iconProps.icon} width={iconProps.size} />
                      </Box>

                      <Stack spacing={0.5} flexGrow={1}>
                        <Stack direction='row' alignItems='center' spacing={1}>
                          <Typography
                            variant='caption'
                            sx={{ color: 'text.disabled', opacity: 0.8 }}
                          >
                            {fDateTime(notification.sent_date)}
                          </Typography>
                          {!notification.read_date && !isDeleting && (
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: 'success.main'
                              }}
                            />
                          )}
                        </Stack>

                        <Typography
                          variant='body2'
                          sx={{
                            whiteSpace: 'pre-line',
                            color: notification.read_date ? 'text.secondary' : 'text.primary',
                            fontWeight: notification.read_date ? 'normal' : 'medium'
                          }}
                        >
                          {renderMessage(notification.message)}
                        </Typography>
                      </Stack>

                      <Stack spacing={1} alignItems='flex-end'>
                        {!isDeleting && (
                          <IconButton
                            size='small'
                            onClick={() => handleDelete(notification._id)}
                            sx={{ color: 'text.disabled' }}
                          >
                            <Iconify icon='solar:trash-bin-trash-bold' width={20} />
                          </IconButton>
                        )}
                      </Stack>
                    </Stack>

                    {isDeleting && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 1,
                          height: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1
                        }}
                      >
                        <Label color='error' variant='filled'>
                          {t('account.notifications.deleted-badge')}
                        </Label>
                      </Box>
                    )}

                    {index < notifications.length - 1 && <Divider sx={{ borderStyle: 'dashed' }} />}
                  </Box>
                )
              })}

              <Box
                ref={observerRef}
                sx={{
                  height: 20,
                  width: 1,
                  visibility: 'hidden',
                  pointerEvents: 'none'
                }}
              />

              {isLoadingMore && (
                <Box sx={{ p: 2, pb: 4, textAlign: 'center' }}>
                  <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                    {t('account.notifications.loading-more')}
                  </Typography>
                </Box>
              )}

              {!hasMore && notifications.length > 0 && !isLoading && (
                <Box sx={{ p: 2, pb: 4, textAlign: 'center' }}>
                  <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                    {t('account.notifications.no-more')}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </Scrollbar>
      </DialogContent>
    </Dialog>
  )
}
