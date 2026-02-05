import { type NextRequest, NextResponse } from 'next/server'

import { DB_BOT_NAME } from 'src/config-global'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { getClientPromiseBot } from 'src/app/api/services/db/_connections/mongo-bot-onnection'

import type { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

const SCHEMA_NOTIFICATIONS = 'notifications'

// ----------------------------------------------------------------------

/**
 * Marks all unread notifications as read for the authenticated user.
 *
 * @param {NextRequest} req - Incoming request.
 * @returns {Promise<NextResponse>} JSON response with update result.
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
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

    // Connect to bot database
    const client = await getClientPromiseBot()
    const db = client.db(DB_BOT_NAME)
    const collection = db.collection(SCHEMA_NOTIFICATIONS)

    // Update all unread notifications
    const result = await collection.updateMany(
      {
        to: user.phone_number,
        deleted_date: null,
        read_date: null
      },
      {
        $set: { read_date: new Date() }
      }
    )

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount
    })
  } catch (ex) {
    console.error(ex)
    return new NextResponse(
      JSON.stringify({ code: 'INTERNAL_ERROR', error: 'Error marking notifications as read' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
