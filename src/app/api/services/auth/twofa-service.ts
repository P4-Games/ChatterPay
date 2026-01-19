import { getUserById, updateUserCode } from 'src/app/api/services/db/chatterpay-db-service'

// ----------------------------------------------------------------------

export type TwoFactorVerificationResult =
  | { ok: true }
  | { ok: false; message: 'USER_NOT_FOUND' | 'CODE_EXPIRED' | 'INVALID_CODE' }

export async function verifyTwoFactorCode(
  userId: string,
  code: string
): Promise<TwoFactorVerificationResult> {
  const user = await getUserById(userId)
  if (!user) {
    return { ok: false, message: 'USER_NOT_FOUND' }
  }

  if (!user.code) {
    return { ok: false, message: 'CODE_EXPIRED' }
  }

  if (user.code.toString() !== code.toString()) {
    return { ok: false, message: 'INVALID_CODE' }
  }

  await updateUserCode(user.id, undefined)
  return { ok: true }
}
