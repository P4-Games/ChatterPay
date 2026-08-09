import { type NextRequest, NextResponse } from 'next/server'

import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { markNotificationsAsRead } from 'src/services/notification-service'

import type { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type IParams = { id: string }

// ----------------------------------------------------------------------

/**
 * Marks all unread notifications as read for the authenticated user.
 *
 * @param {NextRequest} req - Incoming request.
 * @param {{ params: IParams }} ctx - Route params object with user `id`.
 * @returns {Promise<NextResponse>} JSON response with update result.
 */
export async function PATCH(
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

    const success = await markNotificationsAsRead(user.phone_number)

    return NextResponse.json({
      success,
      modifiedCount: success ? 1 : 0 // The backend returns modified_count but we simplify here
    })
  } catch (ex) {
    console.error('[NOTIFICATIONS_MARK_READ_ERROR]', ex)
    return new NextResponse(
      JSON.stringify({ code: 'INTERNAL_ERROR', error: 'Error marking notifications as read' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
