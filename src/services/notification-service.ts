import axios from 'axios'

import { UI_BASE_URL, BACKEND_API_URL, BACKEND_API_TOKEN } from 'src/config-global'

// ----------------------------------------------------------------------

type BackendResponseSuccess<TData extends object> = {
  status: 'success'
  data: TData
  timestamp: string
}

type BackendResponseError = {
  status: 'error'
  data: {
    code: number
    message: string
  }
  timestamp: string
}

type BackendResponse<TData extends object> = BackendResponseSuccess<TData> | BackendResponseError

export type NotificationMedia = 'INTERNAL' | 'WHATSAPP'

export interface INotification {
  _id: string
  to: string
  message: string
  media: NotificationMedia
  template: string
  sent_date: string // ISO Date
  read_date: string | null
  deleted_date: string | null
}

export interface GetNotificationsResponse {
  notifications: INotification[]
  unread_count: number
  has_more: boolean
  next_cursor: string | null
}

// ----------------------------------------------------------------------

/**
 * Fetches paginated notifications for a user.
 * @param phoneNumber User's phone number
 * @param cursor ISO timestamp for pagination
 * @param limit Number of items to return
 */
export async function getNotifications(
  phoneNumber: string,
  cursor?: string,
  limit: number = 20
): Promise<GetNotificationsResponse | null> {
  const params = new URLSearchParams()
  params.append('channel_user_id', phoneNumber)
  if (cursor) params.append('cursor', cursor)
  params.append('limit', String(limit))

  const response = await axios.get<BackendResponse<GetNotificationsResponse>>(
    `${BACKEND_API_URL}/notifications?${params.toString()}`,
    {
      headers: {
        Origin: UI_BASE_URL,
        Authorization: `Bearer ${BACKEND_API_TOKEN}`
      }
    }
  )

  if (response.data.status !== 'success') return null

  return response.data.data
}

/**
 * Marks all unread notifications as read for a user.
 * @param phoneNumber User's phone number
 */
export async function markNotificationsAsRead(phoneNumber: string): Promise<boolean> {
  const response = await axios.patch<BackendResponse<{ modified_count: number }>>(
    `${BACKEND_API_URL}/notifications/mark-read?channel_user_id=${phoneNumber}`,
    {},
    {
      headers: {
        Origin: UI_BASE_URL,
        Authorization: `Bearer ${BACKEND_API_TOKEN}`
      }
    }
  )

  return response.data.status === 'success'
}

/**
 * Soft deletes a notification.
 * @param phoneNumber User's phone number
 * @param notificationId ID of the notification to delete
 */
export async function deleteNotification(
  phoneNumber: string,
  notificationId: string
): Promise<boolean> {
  const response = await axios.delete<BackendResponse<{ modified_count: number }>>(
    `${BACKEND_API_URL}/notifications/${notificationId}?channel_user_id=${phoneNumber}`,
    {
      headers: {
        Origin: UI_BASE_URL,
        Authorization: `Bearer ${BACKEND_API_TOKEN}`
      }
    }
  )

  return response.data.status === 'success'
}
