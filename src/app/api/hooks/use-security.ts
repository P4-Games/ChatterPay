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

export type SecurityEventChannel = 'frontend' | 'bot' | string

export type SecurityEvent = {
  id?: string
  userId?: string
  channelUserId?: string
  channel: SecurityEventChannel
  eventType: string
  message?: string
  details?: Record<string, unknown> | null
  createdAt: string
}

export type SecurityEventsResponse =
  | { ok: true; data: { events: SecurityEvent[] } }
  | { ok: false; message: string }

export type SecurityEventsParams = {
  channel?: SecurityEventChannel
  eventTypes?: string[]
  search?: string
  page?: number
  pageSize?: number
}

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

export function useSecurityEvents(userId?: string, params?: SecurityEventsParams) {
  const query = buildSecurityEventsQuery(params)
  const endpoint = userId
    ? `${endpoints.dashboard.user.security.events(userId)}${query ? `?${query}` : ''}`
    : null
  return useGetCommon(endpoint, userId ? { headers: getAuthorizationHeader() } : {}) as {
    data?: SecurityEventsResponse
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
  questions?: Array<{ questionId: string; answer: string }>
) {
  try {
    const payload: { pin: string; questions?: Array<{ questionId: string; answer: string }> } = {
      pin
    }
    if (questions?.length) {
      payload.questions = questions
    }
    const res = (await post(endpoints.dashboard.user.security.pin(userId), payload, {
      headers: getAuthorizationHeader()
    })) as SecurityMutationResponse

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

function buildSecurityEventsQuery(params?: SecurityEventsParams) {
  if (!params) return ''
  const query = new URLSearchParams()
  if (params.channel) query.set('channel', params.channel)
  if (params.search) query.set('search', params.search)
  if (params.eventTypes?.length) query.set('eventTypes', params.eventTypes.join(','))
  if (typeof params.page === 'number') query.set('page', String(params.page))
  if (typeof params.pageSize === 'number') query.set('pageSize', String(params.pageSize))
  return query.toString()
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
