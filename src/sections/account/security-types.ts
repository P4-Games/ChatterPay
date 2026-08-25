import type { SecurityQuestion } from 'src/app/api/hooks/use-security'

export type SecurityQuestionCatalogItem = SecurityQuestion

export type SelectedSecurityQuestion = SecurityQuestion

export type SecurityQuestionAnswerInput = {
  questionId: string
  answer: string
}

export type SecurityQuestionAnswerMap = Record<string, string>

export const SECURITY_EVENT_TYPES = [
  'QUESTIONS_UPDATED',
  'PIN_RESET',
  'PIN_BLOCKED',
  'PIN_VERIFY_FAILED',
  'PIN_RESET_FAILED',
  'QUESTIONS_SET',
  'PIN_SET'
] as const

export type SecurityEventType = (typeof SECURITY_EVENT_TYPES)[number] | string
