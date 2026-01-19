import { post, endpoints } from 'src/app/api/hooks/api-resolver'
import { getAuthorizationHeader } from 'src/auth/context/jwt/utils'

import { useGetCommon } from './common'

// ----------------------------------------------------------------------

export type SecurityStatus = {
  pinStatus: 'active' | 'blocked' | 'not_set' | 'reset_required'
  failedAttempts: number
  blockedUntil: string | null
  lastSetAt: string | null
  resetRequired: boolean
  recoveryQuestionsSet: boolean
  recoveryQuestionIds: string[]
}

export type SecurityQuestion = {
  questionId: string
  text: string
}

export type SecurityStatusResponse =
  | { ok: true; data: SecurityStatus }
  | { ok: false; message: string }

export type SecurityQuestionsResponse =
  | { ok: true; data: { questions: SecurityQuestion[] } }
  | { ok: false; message: string }

export type SecurityMutationResponse =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; message: string }

// ----------------------------------------------------------------------

export function useSecurityStatus(userId?: string) {
  return useGetCommon(
    userId ? endpoints.dashboard.user.security.status(userId) : null,
    userId ? { headers: getAuthorizationHeader() } : {}
  ) as {
    data?: SecurityStatusResponse
    isLoading: boolean
    error: unknown
    isValidating: boolean
    empty: boolean
  }
}

export const securityStatusSWRKey = (userId: string) =>
  [endpoints.dashboard.user.security.status(userId), { headers: getAuthorizationHeader() }] as const

export function useSecurityQuestionsCatalog(userId?: string) {
  return useGetCommon(
    userId ? endpoints.dashboard.user.security.questions(userId) : null,
    userId ? { headers: getAuthorizationHeader() } : {}
  ) as {
    data?: SecurityQuestionsResponse
    isLoading: boolean
    error: unknown
    isValidating: boolean
    empty: boolean
  }
}

export async function setRecoveryQuestions(
  userId: string,
  questions: Array<{ questionId: string; answer: string }>,
  twoFactorCode: string
) {
  try {
    const res = (await post(
      endpoints.dashboard.user.security.recoveryQuestions(userId),
      { questions, twoFactorCode },
      {
        headers: getAuthorizationHeader()
      }
    )) as SecurityMutationResponse

    return res
  } catch (error) {
    const message = extractErrorMessage(error)
    return { ok: false, message }
  }
}

export async function setPin(
  userId: string,
  pin: string,
  questions: Array<{ questionId: string; answer: string }>
) {
  try {
    const res = (await post(
      endpoints.dashboard.user.security.pin(userId),
      { pin, questions },
      {
        headers: getAuthorizationHeader()
      }
    )) as SecurityMutationResponse

    return res
  } catch (error) {
    const message = extractErrorMessage(error)
    return { ok: false, message }
  }
}

export async function resetPin(
  userId: string,
  newPin: string,
  answers: Array<{ questionId: string; answer: string }>,
  twoFactorCode: string
) {
  try {
    const res = (await post(
      endpoints.dashboard.user.security.resetPin(userId),
      { newPin, answers, twoFactorCode },
      {
        headers: getAuthorizationHeader()
      }
    )) as SecurityMutationResponse

    return res
  } catch (error) {
    const message = extractErrorMessage(error)
    return { ok: false, message }
  }
}

function extractErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return 'Request failed'
  }

  if ('response' in error) {
    const response = (error as { response?: { data?: { message?: string; error?: string } } })
      .response
    return response?.data?.message || response?.data?.error || 'Request failed'
  }

  if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message
  }

  return 'Request failed'
}
