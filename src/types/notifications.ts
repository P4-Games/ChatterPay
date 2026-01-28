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

export interface INotificationResponse {
  notifications: INotification[]
  unreadCount: number
  hasMore: boolean
  nextCursor: string | null
}

// Legacy notification type - deprecated
export interface Notification {
  cta: any
  title: any
  message: any
  app: any
  icon: any
  image: any
  url: any
  blockchain: any
}

