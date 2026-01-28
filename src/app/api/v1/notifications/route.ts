import { type NextRequest, NextResponse } from 'next/server'

import { DB_BOT_NAME } from 'src/config-global'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { getClientPromiseBot } from 'src/app/api/services/db/_connections/mongo-bot-onnection'

import type { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

const SCHEMA_NOTIFICATIONS = 'notifications'
const DEFAULT_LIMIT = 20

// ----------------------------------------------------------------------

/**
 * Returns notifications for the authenticated user.
 *
 * Query parameters (all optional):
 * - cursor: ISO string timestamp for pagination (exclusive)
 * - limit: Number of items to return (default 20)
 *
 * Security validation is enforced before calling the backend service.
 *
 * @param {NextRequest} req - Incoming request with optional query parameters.
 * @returns {Promise<NextResponse>} JSON response with notifications and metadata.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Extract user ID from JWT
    const userId = req.headers.get('x-user-id')

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ code: 'UNAUTHORIZED', error: 'User ID not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const securityCheckResult = await validateRequestSecurity(req, userId)
    if (securityCheckResult instanceof NextResponse) return securityCheckResult

    const user: IAccount | undefined = await getUserById(userId)
    if (!user) {
      return new NextResponse(
        JSON.stringify({ code: 'USER_NOT_FOUND', error: 'user not found with that id' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const sp = req.nextUrl.searchParams
    const cursor = sp.get('cursor') ?? undefined
    const limit = parseInt(sp.get('limit') ?? String(DEFAULT_LIMIT), 10)

    // Connect to bot database
    const client = await getClientPromiseBot()
    const db = client.db(DB_BOT_NAME)
    const collection = db.collection(SCHEMA_NOTIFICATIONS)

    // Build query
    const query: any = {
      to: user.phone_number,
      deleted_date: null
    }

    // Add cursor for pagination
    if (cursor) {
      query.sent_date = { $lt: new Date(cursor) }
    }

    // Fetch notifications
    const notifications = await collection
      .find(query)
      .sort({ sent_date: -1 })
      .limit(limit + 1)
      .toArray()

    // Check if there are more results
    const hasMore = notifications.length > limit
    if (hasMore) {
      notifications.pop() // Remove the extra item
    }

    // Get next cursor
    const nextCursor =
      hasMore && notifications.length > 0
        ? notifications[notifications.length - 1].sent_date.toISOString()
        : null

    // Count unread notifications
    const unreadCount = await collection.countDocuments({
      to: user.phone_number,
      deleted_date: null,
      read_date: null
    })

    // Format response
    const formattedNotifications = notifications.map((notif: any) => ({
      _id: notif._id.toString(),
      to: notif.to,
      message: notif.message,
      media: notif.media,
      template: notif.template,
      sent_date: notif.sent_date,
      read_date: notif.read_date,
      deleted_date: notif.deleted_date
    }))

    return NextResponse.json({
      notifications: formattedNotifications,
      unreadCount,
      hasMore,
      nextCursor
    })
  } catch (ex) {
    console.error(ex)
    return new NextResponse(
      JSON.stringify({ code: 'INTERNAL_ERROR', error: 'Error fetching notifications' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
