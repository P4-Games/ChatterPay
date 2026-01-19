import axios from 'axios'

import { UI_BASE_URL, BACKEND_API_URL, BACKEND_API_TOKEN } from 'src/config-global'

// ----------------------------------------------------------------------

type BackendResponseSuccess<TData extends object> = {
  status: 'success'
  data: TData
  timestamp: string
}

type BackendResponseError = {
  status: 'error'
  data: {
    code: number
    message: string
  }
  timestamp: string
}

type BackendResponse<TData extends object> = BackendResponseSuccess<TData> | BackendResponseError

type ServiceResult<TData extends object> =
  | { ok: true; data: TData; message?: string }
  | { ok: false; message: string }

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

export type SecurityRecoveryQuestionsResult = {
  recoveryQuestionsSet: boolean
  recoveryQuestionIds: string[]
}

export type SecurityPinResult = {
  updated?: boolean
  pinStatus?: 'active'
  lastSetAt?: string
}

// ----------------------------------------------------------------------

const backendHeaders = {
  Origin: UI_BASE_URL,
  Authorization: `Bearer ${BACKEND_API_TOKEN}`
}

const normalizeError = (response: BackendResponseError) => response.data?.message || 'Unknown error'

export async function getSecurityStatus(
  phoneNumber: string
): Promise<ServiceResult<SecurityStatus>> {
  const response = await axios.post<
    BackendResponse<{
      pin_status: 'active' | 'blocked' | 'not_set'
      failed_attempts: number
      blocked_until: string | null
      last_set_at: string | null
      reset_required: boolean
      recovery_questions_set: boolean
      recovery_question_ids: string[]
    }>
  >(
    `${BACKEND_API_URL}/get_security_status/`,
    { channel_user_id: phoneNumber },
    { headers: backendHeaders }
  )

  if (response.data.status !== 'success') {
    return { ok: false, message: normalizeError(response.data) }
  }

  const payload = response.data.data
  return {
    ok: true,
    data: {
      pinStatus: payload.reset_required ? 'reset_required' : payload.pin_status,
      failedAttempts: payload.failed_attempts,
      blockedUntil: payload.blocked_until ?? null,
      lastSetAt: payload.last_set_at ?? null,
      resetRequired: payload.reset_required,
      recoveryQuestionsSet: payload.recovery_questions_set,
      recoveryQuestionIds: payload.recovery_question_ids ?? []
    }
  }
}

export async function getSecurityQuestionsCatalog(
  phoneNumber: string
): Promise<ServiceResult<{ questions: SecurityQuestion[] }>> {
  const response = await axios.post<
    BackendResponse<{
      questions: Array<{ question_id: string; text: string }>
    }>
  >(
    `${BACKEND_API_URL}/get_security_questions/`,
    { channel_user_id: phoneNumber },
    { headers: backendHeaders }
  )

  if (response.data.status !== 'success') {
    return { ok: false, message: normalizeError(response.data) }
  }

  return {
    ok: true,
    data: {
      questions: (response.data.data.questions ?? []).map((question) => ({
        questionId: question.question_id,
        text: question.text
      }))
    }
  }
}

export async function setSecurityRecoveryQuestions(
  phoneNumber: string,
  questions: Array<{ questionId: string; answer: string }>
): Promise<ServiceResult<SecurityRecoveryQuestionsResult>> {
  const response = await axios.post<
    BackendResponse<{
      recovery_questions_set: boolean
      recovery_question_ids: string[]
    }>
  >(
    `${BACKEND_API_URL}/set_security_recovery_questions/`,
    {
      channel_user_id: phoneNumber,
      channel: 'frontend',
      questions: questions.map((question) => ({
        question_id: question.questionId,
        answer: question.answer
      }))
    },
    { headers: backendHeaders }
  )

  if (response.data.status !== 'success') {
    return { ok: false, message: normalizeError(response.data) }
  }

  return {
    ok: true,
    data: {
      recoveryQuestionsSet: response.data.data.recovery_questions_set ?? false,
      recoveryQuestionIds: response.data.data.recovery_question_ids ?? []
    }
  }
}

export async function setSecurityPin(
  phoneNumber: string,
  pin: string,
  questions: Array<{ questionId: string; answer: string }>
): Promise<ServiceResult<SecurityPinResult>> {
  const questionsPayload = (questions ?? []).map((question) => ({
    question_id: question.questionId,
    answer: question.answer
  }))
  const payload: Record<string, unknown> = {
    channel_user_id: phoneNumber,
    pin,
    channel: 'frontend'
  }
  if (questionsPayload.length) {
    payload.questions = questionsPayload
  }

  const response = await axios.post<
    BackendResponse<{
      updated?: boolean
      pin_status?: 'active'
      last_set_at?: string
    }>
  >(`${BACKEND_API_URL}/set_security_pin/`, payload, { headers: backendHeaders })

  if (response.data.status !== 'success') {
    return { ok: false, message: normalizeError(response.data) }
  }

  return {
    ok: true,
    data: {
      updated: response.data.data.updated,
      pinStatus: response.data.data.pin_status,
      lastSetAt: response.data.data.last_set_at
    }
  }
}

export async function resetSecurityPin(
  phoneNumber: string,
  newPin: string,
  answers: Array<{ questionId: string; answer: string }>
): Promise<ServiceResult<SecurityPinResult>> {
  const response = await axios.post<
    BackendResponse<{
      pin_status?: 'active'
      last_set_at?: string
    }>
  >(
    `${BACKEND_API_URL}/reset_security_pin/`,
    {
      channel_user_id: phoneNumber,
      new_pin: newPin,
      channel: 'frontend',
      answers: answers.map((answer) => ({
        question_id: answer.questionId,
        answer: answer.answer
      }))
    },
    { headers: backendHeaders }
  )

  if (response.data.status !== 'success') {
    return { ok: false, message: normalizeError(response.data) }
  }

  return {
    ok: true,
    data: {
      pinStatus: response.data.data.pin_status,
      lastSetAt: response.data.data.last_set_at
    }
  }
}
