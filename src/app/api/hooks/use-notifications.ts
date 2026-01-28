import useSWR from 'swr'
import { useMemo, useCallback } from 'react'
import useSWRInfinite from 'swr/infinite'

import { notificationsRefreshInterval } from 'src/config-global'
import { endpoints, fetcher } from 'src/app/api/hooks/api-resolver'
import { getAuthorizationHeader } from 'src/auth/context/jwt/utils'

import type { INotificationResponse } from 'src/types/notifications'

// ----------------------------------------------------------------------

const LIMIT = 20

// ----------------------------------------------------------------------

/**
 * Hook for fetching and managing user notifications with infinite scroll
 * @param userId - The user ID to fetch notifications for
 * @returns Notifications data, loading states, and utility functions
 */
export function useGetNotifications(userId: string) {
  const getKey = (pageIndex: number, previousPageData: INotificationResponse | null) => {
    // If we've reached the end or have no more data, don't fetch more
    if (pageIndex !== 0 && (!previousPageData || !previousPageData.hasMore)) return null

    // First page call - no cursor
    if (pageIndex === 0) {
      return [
        endpoints.dashboard.user.notifications.root(userId, undefined, LIMIT),
        { headers: getAuthorizationHeader() }
      ]
    }

    // Subsequent pages MUST have a cursor
    const cursor = previousPageData?.nextCursor
    if (cursor === null || typeof cursor === 'undefined') return null

    return [
      endpoints.dashboard.user.notifications.root(userId, cursor, LIMIT),
      { headers: getAuthorizationHeader() }
    ]
  }

  const { data, error, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite<INotificationResponse>(getKey, fetcher, {
      refreshInterval: notificationsRefreshInterval,
      revalidateFirstPage: true,
      revalidateAll: false
    })

  // Flatten all notifications from all pages
  const allNotifications = useMemo(() => data?.flatMap((page) => page.notifications) ?? [], [data])

  // Check if we are loading the first page or subsequent pages
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')

  // Get unread count from the most recent page
  const unreadCount = useMemo(() => data?.[0]?.unreadCount ?? 0, [data])

  // Check if we can load more
  const hasMore = useMemo(() => {
    const lastPage = data?.[data.length - 1]
    return lastPage?.hasMore ?? false
  }, [data])

  // Load more function
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setSize(size + 1)
    }
  }, [hasMore, isLoadingMore, setSize, size])

  const memoizedValue = useMemo(
    () => ({
      notifications: allNotifications,
      unreadCount,
      hasMore,
      isLoading,
      isLoadingMore,
      error,
      isValidating,
      loadMore,
      mutate
    }),
    [
      allNotifications,
      unreadCount,
      hasMore,
      isLoading,
      isLoadingMore,
      error,
      isValidating,
      loadMore,
      mutate
    ]
  )

  return memoizedValue
}

/**
 * Hook for marking all notifications as read
 * @param userId - The user ID
 * @returns Function to mark all as read
 */
export function useMarkNotificationsAsRead(userId: string) {
  return useCallback(async () => {
    try {
      const response = await fetch(endpoints.dashboard.user.notifications.markRead(userId), {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthorizationHeader()
        }
      })

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read')
      }

      return await response.json()
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      throw error
    }
  }, [userId])
}

/**
 * Hook for deleting a notification
 * @param userId - The user ID
 * @returns Function to delete a notification
 */
export function useDeleteNotification(userId: string) {
  return useCallback(
    async (notificationId: string) => {
      try {
        const response = await fetch(
          endpoints.dashboard.user.notifications.delete(userId, notificationId),
          {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthorizationHeader()
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to delete notification')
        }

        return await response.json()
      } catch (error) {
        console.error('Error deleting notification:', error)
        throw error
      }
    },
    [userId]
  )
}
