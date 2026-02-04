import { type NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'

import { DB_BOT_NAME } from 'src/config-global'
import { validateRequestSecurity } from 'src/app/api/middleware/validators/base-security-validator'
import { getUserById } from 'src/app/api/services/db/chatterpay-db-service'
import { getClientPromiseBot } from 'src/app/api/services/db/_connections/mongo-bot-onnection'

import type { IAccount } from 'src/types/account'

// ----------------------------------------------------------------------

type IParams = { id: string }

const SCHEMA_NOTIFICATIONS = 'notifications'

// ----------------------------------------------------------------------

/**
 * Soft deletes a notification by setting the deleted_date timestamp.
 *
 * @param {NextRequest} req - Incoming request.
 * @param {{ params: IParams }} ctx - Route params object with notification `id`.
 * @returns {Promise<NextResponse>} JSON response with delete result.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: IParams }
): Promise<NextResponse> {
  try {
    const { id } = params

    if (!id) {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_REQUEST_PARAMS',
          error: 'Missing notification ID'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

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

    // Validate ObjectId format
    let objectId: ObjectId
    try {
      objectId = new ObjectId(id)
    } catch {
      return new NextResponse(
        JSON.stringify({
          code: 'INVALID_NOTIFICATION_ID',
          error: 'Invalid notification ID format'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Soft delete the notification (only if it belongs to the user)
    const result = await collection.updateOne(
      {
        _id: objectId,
        to: user.phone_number,
        deleted_date: null
      },
      {
        $set: { deleted_date: new Date() }
      }
    )

    if (result.matchedCount === 0) {
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
      modifiedCount: result.modifiedCount
    })
  } catch (ex) {
    console.error(ex)
    return new NextResponse(
      JSON.stringify({ code: 'INTERNAL_ERROR', error: 'Error deleting notification' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
