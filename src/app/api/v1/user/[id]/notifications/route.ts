import { type NextRequest, NextResponse } from 'next/server'

import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { getNotifications } from 'src/services/notification-service'

import type { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type IParams = { id: string }

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
 * @param {{ params: IParams }} ctx - Route params object with user `id`.
 * @returns {Promise<NextResponse>} JSON response with notifications and metadata.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: IParams }
): Promise<NextResponse> {
  try {
    const { id } = params

    if (!id) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing user ID'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const securityCheckResult = await validateRequestSecurity(req, id)
    if (securityCheckResult instanceof NextResponse) return securityCheckResult

    const user: IAccount | undefined = await getUserById(id)
    if (!user) {
      return new NextResponse(
        JSON.stringify({ code: 'USER_NOT_FOUND', error: 'user not found with that id' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const sp = req.nextUrl.searchParams
    const cursor = sp.get('cursor') || undefined
    const limit = parseInt(sp.get('limit') || String(DEFAULT_LIMIT), 10)

    const data = await getNotifications(user.phone_number, cursor, limit)

    if (!data) {
      return new NextResponse(
        JSON.stringify({
          code: 'BACKEND_ERROR',
          error: 'Error fetching notifications from backend'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Format response to match the frontend expectations
    return NextResponse.json({
      notifications: data.notifications,
      unreadCount: data.unread_count,
      hasMore: data.has_more,
      nextCursor: data.next_cursor
    })
  } catch (ex) {
    console.error('[NOTIFICATIONS_GET_ERROR]', ex)
    return new NextResponse(
      JSON.stringify({ code: 'INTERNAL_ERROR', error: 'Error fetching notifications' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
