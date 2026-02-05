import { type NextRequest, NextResponse } from 'next/server'

import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { deleteNotification } from 'src/services/notification-service'

import type { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type IParams = { id: string; notificationId: string }

// ----------------------------------------------------------------------

/**
 * Soft deletes a notification by setting the deleted_date timestamp.
 *
 * @param {NextRequest} req - Incoming request.
 * @param {{ params: IParams }} ctx - Route params object with user `id` and `notificationId`.
 * @returns {Promise<NextResponse>} JSON response with delete result.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: IParams }
): Promise<NextResponse> {
  try {
    const { id, notificationId } = params

    if (!id || !notificationId) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing user ID or notification ID'
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

    const success = await deleteNotification(user.phone_number, notificationId)

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          code: 'NOTIFICATION_NOT_FOUND',
          error: 'Notification not found or already deleted'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return NextResponse.json({
      success: true,
      modifiedCount: 1
    })
  } catch (ex) {
    console.error('[NOTIFICATIONS_DELETE_ERROR]', ex)
    return new NextResponse(
      JSON.stringify({ code: 'INTERNAL_ERROR', error: 'Error deleting notification' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
